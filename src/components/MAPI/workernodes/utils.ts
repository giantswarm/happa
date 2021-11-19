import produce from 'immer';
import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { BootstrapConfig, NodePool, ProviderNodePool } from 'MAPI/types';
import {
  compareNodePools,
  fetchProviderNodePoolsForNodePools,
  fetchProviderNodePoolsForNodePoolsKey,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { IHttpClient } from 'model/clients/HttpClient';
import { Constants, Providers } from 'model/constants';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as corev1 from 'model/services/mapi/corev1';
import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import { mutate } from 'swr';

export async function updateNodePoolDescription(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePool: NodePool,
  newDescription: string
) {
  switch (nodePool.apiVersion) {
    case 'exp.cluster.x-k8s.io/v1alpha3': {
      const client = httpClientFactory();

      let machinePool = await capiexpv1alpha3.getMachinePool(
        client,
        auth,
        nodePool.metadata.namespace!,
        nodePool.metadata.name
      );
      const description =
        capiexpv1alpha3.getMachinePoolDescription(machinePool);
      if (description === newDescription) {
        return machinePool;
      }

      machinePool.metadata.annotations ??= {};
      machinePool.metadata.annotations[
        capiexpv1alpha3.annotationMachinePoolDescription
      ] = newDescription;

      machinePool = await capiexpv1alpha3.updateMachinePool(
        client,
        auth,
        machinePool
      );

      mutate(
        capiexpv1alpha3.getMachinePoolKey(
          machinePool.metadata.namespace!,
          machinePool.metadata.name
        ),
        machinePool
      );

      mutate(
        capiexpv1alpha3.getMachinePoolListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelCluster]:
                machinePool.metadata.labels![capiv1alpha3.labelCluster],
            },
          },
        })
      );

      return machinePool;
    }

    case 'cluster.x-k8s.io/v1alpha3': {
      let [providerNodePool] = await fetchProviderNodePoolsForNodePools(
        httpClientFactory,
        auth,
        [nodePool]
      );

      const apiVersion = providerNodePool?.apiVersion;

      if (
        apiVersion !== 'infrastructure.giantswarm.io/v1alpha2' &&
        apiVersion !== 'infrastructure.giantswarm.io/v1alpha3'
      ) {
        return Promise.reject(new Error('Unsupported provider.'));
      }

      const client = httpClientFactory();

      providerNodePool!.spec.nodePool.description = newDescription;

      providerNodePool = await infrav1alpha3.updateAWSMachineDeployment(
        client,
        auth,
        providerNodePool as infrav1alpha3.IAWSMachineDeployment
      );

      mutate(
        infrav1alpha3.getAWSMachineDeploymentKey(
          providerNodePool.metadata.namespace!,
          providerNodePool.metadata.name
        ),
        providerNodePool,
        false
      );

      const nodePoolList = await capiv1alpha3.getMachineDeploymentList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [infrav1alpha3.labelCluster]:
                nodePool.metadata.labels![infrav1alpha3.labelCluster],
            },
          },
        }
      );

      nodePoolList.items = nodePoolList.items.sort(compareNodePools);

      mutate(
        fetchProviderNodePoolsForNodePoolsKey(nodePoolList.items),
        produce((draft?: ProviderNodePool[]) => {
          if (!draft) return;

          for (let i = 0; i < draft.length; i++) {
            if (draft[i]!.metadata.name === providerNodePool!.metadata.name) {
              draft[i] = providerNodePool;
            }
          }
        }),
        false
      );

      return nodePool;
    }

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export async function deleteNodePool(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePool: NodePool
) {
  switch (nodePool.apiVersion) {
    case 'exp.cluster.x-k8s.io/v1alpha3': {
      const client = httpClientFactory();

      const machinePool = await capiexpv1alpha3.getMachinePool(
        client,
        auth,
        nodePool.metadata.namespace!,
        nodePool.metadata.name
      );

      await capiexpv1alpha3.deleteMachinePool(client, auth, machinePool);

      machinePool.metadata.deletionTimestamp = new Date().toISOString();

      mutate(
        capiexpv1alpha3.getMachinePoolKey(
          machinePool.metadata.namespace!,
          machinePool.metadata.name
        ),
        machinePool,
        false
      );

      // Update the deleted machine pool in place.
      mutate(
        capiexpv1alpha3.getMachinePoolListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelCluster]:
                machinePool.metadata.labels![capiv1alpha3.labelCluster],
            },
          },
        }),
        produce((draft?: capiexpv1alpha3.IMachinePoolList) => {
          if (!draft) return;

          for (let i = 0; i < draft.items.length; i++) {
            if (draft.items[i].metadata.name === machinePool.metadata.name) {
              draft.items[i] = machinePool;
            }
          }

          draft.items = draft.items.sort(compareNodePools);
        }),
        false
      );

      return machinePool;
    }

    case 'cluster.x-k8s.io/v1alpha3': {
      const client = httpClientFactory();

      const machineDeployment = await capiv1alpha3.getMachineDeployment(
        client,
        auth,
        nodePool.metadata.namespace!,
        nodePool.metadata.name
      );

      await capiv1alpha3.deleteMachineDeployment(
        client,
        auth,
        machineDeployment
      );

      machineDeployment.metadata.deletionTimestamp = new Date().toISOString();

      mutate(
        capiv1alpha3.getMachineDeploymentKey(
          machineDeployment.metadata.namespace!,
          machineDeployment.metadata.name
        ),
        machineDeployment,
        false
      );

      mutate(
        capiv1alpha3.getMachineDeploymentListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelCluster]:
                machineDeployment.metadata.labels![capiv1alpha3.labelCluster],
            },
          },
        }),
        produce((draft?: capiv1alpha3.IMachineDeploymentList) => {
          if (!draft) return;

          for (let i = 0; i < draft.items.length; i++) {
            if (
              draft.items[i].metadata.name === machineDeployment.metadata.name
            ) {
              draft.items[i] = machineDeployment;
            }
          }

          draft.items = draft.items.sort(compareNodePools);
        }),
        false
      );

      return machineDeployment;
    }
  }

  return Promise.reject(new Error('Unsupported provider.'));
}

export async function deleteProviderNodePool(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePool: NodePool
) {
  let [providerNodePool] = await fetchProviderNodePoolsForNodePools(
    httpClientFactory,
    auth,
    [nodePool]
  );

  switch (providerNodePool?.apiVersion) {
    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3': {
      const client = httpClientFactory();

      providerNodePool = await infrav1alpha3.getAWSMachineDeployment(
        client,
        auth,
        providerNodePool.metadata.namespace!,
        providerNodePool.metadata.name
      );

      await infrav1alpha3.deleteAWSMachineDeployment(
        client,
        auth,
        providerNodePool
      );

      providerNodePool.metadata.deletionTimestamp = new Date().toISOString();

      mutate(
        fetchProviderNodePoolsForNodePoolsKey([nodePool]),
        providerNodePool,
        false
      );

      return providerNodePool;
    }

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export async function deleteNodePoolResources(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePool: NodePool
) {
  try {
    await deleteNodePool(httpClientFactory, auth, nodePool);

    const apiVersion =
      nodePool.spec?.template.spec?.infrastructureRef?.apiVersion;

    if (
      apiVersion === 'infrastructure.giantswarm.io/v1alpha2' ||
      apiVersion === 'infrastructure.giantswarm.io/v1alpha3'
    ) {
      await deleteProviderNodePool(httpClientFactory, auth, nodePool);
    }
  } catch (err) {
    if (
      !metav1.isStatusError(
        (err as GenericResponseError).data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      return Promise.reject(err);
    }
  }

  return Promise.resolve();
}

export async function updateNodePoolScaling(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePool: NodePool,
  min: number,
  max: number
) {
  switch (nodePool.apiVersion) {
    case 'exp.cluster.x-k8s.io/v1alpha3': {
      const client = httpClientFactory();

      let machinePool = await capiexpv1alpha3.getMachinePool(
        client,
        auth,
        nodePool.metadata.namespace!,
        nodePool.metadata.name
      );

      if (
        nodePool.metadata.annotations?.[
          capiexpv1alpha3.annotationMachinePoolMinSize
        ] === min.toString() &&
        nodePool.metadata.annotations?.[
          capiexpv1alpha3.annotationMachinePoolMaxSize
        ] === max.toString()
      ) {
        return machinePool;
      }

      machinePool.metadata.annotations ??= {};
      machinePool.metadata.annotations[
        capiexpv1alpha3.annotationMachinePoolMinSize
      ] = min.toString();
      machinePool.metadata.annotations[
        capiexpv1alpha3.annotationMachinePoolMaxSize
      ] = max.toString();

      machinePool = await capiexpv1alpha3.updateMachinePool(
        client,
        auth,
        machinePool
      );

      mutate(
        capiexpv1alpha3.getMachinePoolKey(
          machinePool.metadata.namespace!,
          machinePool.metadata.name
        ),
        machinePool,
        false
      );

      // Update the updated machine pool in place.
      mutate(
        capiexpv1alpha3.getMachinePoolListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelCluster]:
                machinePool.metadata.labels![capiv1alpha3.labelCluster],
            },
          },
        }),
        produce((draft?: capiexpv1alpha3.IMachinePoolList) => {
          if (!draft) return;

          for (let i = 0; i < draft.items.length; i++) {
            if (draft.items[i].metadata.name === machinePool.metadata.name) {
              draft.items[i] = machinePool;
            }
          }

          draft.items = draft.items.sort(compareNodePools);
        }),
        false
      );

      return machinePool;
    }

    case 'cluster.x-k8s.io/v1alpha3': {
      let [providerNodePool] = await fetchProviderNodePoolsForNodePools(
        httpClientFactory,
        auth,
        [nodePool]
      );

      const apiVersion = providerNodePool?.apiVersion;
      if (
        apiVersion !== 'infrastructure.giantswarm.io/v1alpha2' &&
        apiVersion !== 'infrastructure.giantswarm.io/v1alpha3'
      ) {
        return Promise.reject(new Error('Unsupported provider.'));
      }

      const client = httpClientFactory();

      if (
        providerNodePool!.spec.nodePool.scaling.min === min &&
        providerNodePool!.spec.nodePool.scaling.max === max
      ) {
        return nodePool;
      }

      providerNodePool!.spec.nodePool.scaling.min = min;
      providerNodePool!.spec.nodePool.scaling.max = max;

      providerNodePool = await infrav1alpha3.updateAWSMachineDeployment(
        client,
        auth,
        providerNodePool as infrav1alpha3.IAWSMachineDeployment
      );

      mutate(
        infrav1alpha3.getAWSMachineDeploymentKey(
          providerNodePool.metadata.namespace!,
          providerNodePool.metadata.name
        ),
        providerNodePool,
        false
      );

      const nodePoolList = await capiv1alpha3.getMachineDeploymentList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [infrav1alpha3.labelCluster]:
                nodePool.metadata.labels![infrav1alpha3.labelCluster],
            },
          },
        }
      );

      nodePoolList.items = nodePoolList.items.sort(compareNodePools);

      mutate(
        fetchProviderNodePoolsForNodePoolsKey(nodePoolList.items),
        produce((draft?: ProviderNodePool[]) => {
          if (!draft) return;

          for (let i = 0; i < draft.length; i++) {
            if (draft[i]!.metadata.name === providerNodePool!.metadata.name) {
              draft[i] = providerNodePool;
            }
          }
        }),
        false
      );

      return nodePool;
    }

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export function createDefaultBootstrapConfig(
  provider: PropertiesOf<typeof Providers>,
  config: {
    namespace: string;
    name: string;
    clusterName: string;
  }
) {
  switch (provider) {
    case Providers.AZURE:
      return createDefaultSpark(config);
    case Providers.AWS:
      return undefined;
    default:
      throw new Error('Unsupported provider.');
  }
}

export function createDefaultSpark(config: {
  namespace: string;
  name: string;
  clusterName: string;
}): gscorev1alpha1.ISpark {
  return {
    apiVersion: 'core.giantswarm.io/v1alpha1',
    kind: gscorev1alpha1.Spark,
    metadata: {
      namespace: config.namespace,
      name: config.name,
      labels: {
        [capiv1alpha3.labelCluster]: config.clusterName,
        [capiv1alpha3.labelClusterName]: config.clusterName,
      },
    },
    spec: {},
    status: {} as gscorev1alpha1.ISparkStatus,
  };
}

export function createDefaultProviderNodePool(
  provider: PropertiesOf<typeof Providers>,
  config: {
    namespace: string;
    name: string;
    clusterName: string;
    organization: string;
    location: string;
  }
) {
  switch (provider) {
    case Providers.AZURE:
      return createDefaultAzureMachinePool(config);
    case Providers.AWS:
      return createDefaultAWSMachineDeployment(config);
    default:
      throw new Error('Unsupported provider.');
  }
}

export function createDefaultAzureMachinePool(config: {
  namespace: string;
  name: string;
  clusterName: string;
  organization: string;
  location: string;
}): capzexpv1alpha3.IAzureMachinePool {
  return {
    apiVersion: 'exp.infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: capzexpv1alpha3.AzureMachinePool,
    metadata: {
      namespace: config.namespace,
      name: config.name,
      labels: {
        [capiexpv1alpha3.labelMachinePool]: config.name,
        [capiv1alpha3.labelCluster]: config.clusterName,
        [capiv1alpha3.labelClusterName]: config.clusterName,
        [capiv1alpha3.labelOrganization]: config.organization,
      },
    },
    spec: {
      location: config.location,
      template: {
        sshPublicKey: '',
        vmSize: Constants.AZURE_NODEPOOL_DEFAULT_VM_SIZE,
        osDisk: {
          diskSizeGB: 0,
          managedDisk: {
            storageAccountType: '',
          },
          osType: '',
        },
      },
    },
  };
}

export function createDefaultAWSMachineDeployment(config: {
  namespace: string;
  name: string;
  clusterName: string;
  organization: string;
  location: string;
}): infrav1alpha3.IAWSMachineDeployment {
  return {
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: infrav1alpha3.AWSMachineDeployment,
    metadata: {
      namespace: config.namespace,
      name: config.name,
      labels: {
        [infrav1alpha3.labelCluster]: config.clusterName,
        [infrav1alpha3.labelOrganization]: config.organization,
        [infrav1alpha3.labelMachineDeployment]: config.name,
      },
    },
    spec: {
      nodePool: {
        description: Constants.DEFAULT_NODEPOOL_DESCRIPTION,
        machine: {
          dockerVolumeSizeGB: 100,
          kubeletVolumeSizeGB: 100,
        },
        scaling: {
          min: Constants.NP_DEFAULT_MIN_SCALING,
          max: Constants.NP_DEFAULT_MAX_SCALING,
        },
      },
      provider: {
        availabilityZones: [],
        worker: {
          instanceType: Constants.AWS_NODEPOOL_DEFAULT_INSTANCE_TYPE,
          useAlikeInstanceTypes: false,
        },
        instanceDistribution: {
          onDemandBaseCapacity: 0,
          onDemandPercentageAboveBaseCapacity: 100,
        },
      },
    },
  };
}

export function createDefaultNodePool(config: {
  providerNodePool: ProviderNodePool;
  bootstrapConfig: BootstrapConfig;
}) {
  switch (config.providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
      return createDefaultMachinePool(config);
    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return createDefaultMachineDeployment(config);
    default:
      throw new Error('Unsupported provider.');
  }
}

function createDefaultMachinePool(config: {
  providerNodePool: ProviderNodePool;
  bootstrapConfig: BootstrapConfig;
}): capiexpv1alpha3.IMachinePool {
  const namespace = config.providerNodePool!.metadata.namespace;
  const name = config.providerNodePool!.metadata.name;
  const organization =
    config.providerNodePool!.metadata.labels![capiv1alpha3.labelOrganization];
  const clusterName =
    config.providerNodePool!.metadata.labels![capiv1alpha3.labelClusterName];

  return {
    apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
    kind: capiexpv1alpha3.MachinePool,
    metadata: {
      name,
      namespace,
      labels: {
        [capiexpv1alpha3.labelMachinePool]: name,
        [capiv1alpha3.labelCluster]: clusterName,
        [capiv1alpha3.labelClusterName]: clusterName,
        [capiv1alpha3.labelOrganization]: organization,
      },
      annotations: {
        [capiexpv1alpha3.annotationMachinePoolDescription]:
          Constants.DEFAULT_NODEPOOL_DESCRIPTION,
        [capiexpv1alpha3.annotationMachinePoolMinSize]:
          Constants.NP_DEFAULT_MIN_SCALING.toString(),
        [capiexpv1alpha3.annotationMachinePoolMaxSize]:
          Constants.NP_DEFAULT_MAX_SCALING.toString(),
      },
    },
    spec: {
      clusterName,
      replicas: Constants.NP_DEFAULT_MIN_SCALING,
      template: {
        metadata: {} as metav1.IObjectMeta,
        spec: {
          clusterName,
          bootstrap: {
            configRef: config.bootstrapConfig
              ? corev1.getObjectReference(config.bootstrapConfig)
              : undefined,
          },
          infrastructureRef: corev1.getObjectReference(
            config.providerNodePool!
          ),
        },
      },
    },
  };
}

function createDefaultMachineDeployment(config: {
  providerNodePool: ProviderNodePool;
  bootstrapConfig: BootstrapConfig;
}): capiv1alpha3.IMachineDeployment {
  const namespace = config.providerNodePool!.metadata.namespace;
  const name = config.providerNodePool!.metadata.name;
  const organization =
    config.providerNodePool!.metadata.labels![capiv1alpha3.labelOrganization];
  const clusterName =
    config.providerNodePool!.metadata.labels![capiv1alpha3.labelCluster];

  return {
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: capiv1alpha3.MachineDeployment,
    metadata: {
      name,
      namespace,
      labels: {
        [infrav1alpha3.labelMachineDeployment]: name,
        [capiv1alpha3.labelCluster]: clusterName,
        [capiv1alpha3.labelClusterName]: clusterName,
        [capiv1alpha3.labelOrganization]: organization,
      },
    },
    spec: {
      clusterName,
      template: {
        metadata: {} as metav1.IObjectMeta,
        spec: {
          clusterName,
          bootstrap: {},
          infrastructureRef: corev1.getObjectReference(
            config.providerNodePool!
          ),
        },
      },
      selector: {
        matchingLabels: {},
      },
      minReadySeconds: 0,
      progressDeadlineSeconds: 0,
      replicas: 0,
      strategy: {},
    },
  };
}

export async function createNodePool(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  config: {
    nodePool: NodePool;
    providerNodePool: ProviderNodePool;
    bootstrapConfig: BootstrapConfig;
  }
): Promise<{
  nodePool: NodePool;
  providerNodePool: ProviderNodePool;
  bootstrapConfig: BootstrapConfig;
}> {
  switch (config.providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3': {
      // eslint-disable-next-line @typescript-eslint/init-declarations
      let bootstrapConfig: BootstrapConfig;
      if (config.bootstrapConfig) {
        bootstrapConfig = await gscorev1alpha1.createSpark(
          httpClient,
          auth,
          config.bootstrapConfig
        );
      }

      const providerNodePool = await capzexpv1alpha3.createAzureMachinePool(
        httpClient,
        auth,
        config.providerNodePool
      );

      mutate(
        capzexpv1alpha3.getAzureMachinePoolKey(
          providerNodePool.metadata.namespace!,
          providerNodePool.metadata.name
        ),
        providerNodePool,
        false
      );

      const nodePool = await capiexpv1alpha3.createMachinePool(
        httpClient,
        auth,
        config.nodePool as capiexpv1alpha3.IMachinePool
      );

      mutate(
        capiexpv1alpha3.getMachinePoolKey(
          nodePool.metadata.namespace!,
          nodePool.metadata.name
        ),
        nodePool,
        false
      );

      // Add the created node pool to the existing list.
      mutate(
        capiexpv1alpha3.getMachinePoolListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelCluster]:
                nodePool.metadata.labels![capiv1alpha3.labelCluster],
            },
          },
        }),
        produce((draft?: capiexpv1alpha3.IMachinePoolList) => {
          if (!draft) return;

          draft.items.push(nodePool);
          draft.items = draft.items.sort(compareNodePools);
        }),
        false
      );

      return { nodePool, providerNodePool, bootstrapConfig };
    }

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3': {
      const providerNodePool = await infrav1alpha3.createAWSMachineDeployment(
        httpClient,
        auth,
        config.providerNodePool as infrav1alpha3.IAWSMachineDeployment
      );

      mutate(
        infrav1alpha3.getAWSMachineDeploymentKey(
          providerNodePool.metadata.namespace!,
          providerNodePool.metadata.name
        ),
        providerNodePool,
        false
      );

      const nodePool = await capiv1alpha3.createMachineDeployment(
        httpClient,
        auth,
        config.nodePool as capiv1alpha3.IMachineDeployment
      );

      mutate(
        capiv1alpha3.getMachineDeploymentKey(
          nodePool.metadata.namespace!,
          nodePool.metadata.name
        ),
        nodePool,
        false
      );

      // Add the created node pool to the existing list.
      mutate(
        capiv1alpha3.getMachineDeploymentListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelCluster]:
                nodePool.metadata.labels![capiv1alpha3.labelCluster],
            },
          },
        }),
        produce((draft?: capiv1alpha3.IMachineDeploymentList) => {
          if (!draft) return;

          draft.items.push(nodePool);
          draft.items = draft.items.sort(compareNodePools);
        }),
        false
      );

      return { nodePool, providerNodePool, bootstrapConfig: undefined };
    }

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}
