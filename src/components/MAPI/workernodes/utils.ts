import produce from 'immer';
import { BootstrapConfig, NodePool, ProviderNodePool } from 'MAPI/types';
import {
  compareNodePools,
  fetchProviderNodePoolForNodePool,
  fetchProviderNodePoolsForNodePoolsKey,
  IProviderNodePoolForNodePoolName,
} from 'MAPI/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { IHttpClient } from 'model/clients/HttpClient';
import { Constants, Providers } from 'model/constants';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as corev1 from 'model/services/mapi/corev1';
import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import { mutate } from 'swr';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import { compare } from 'utils/semver';

export async function updateNodePoolDescription(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePool: NodePool,
  newDescription: string
) {
  const kind = nodePool.kind;
  const apiVersion = nodePool.apiVersion;

  switch (true) {
    // Azure
    case kind === capiexpv1alpha3.MachinePool &&
      apiVersion === capiexpv1alpha3.ApiVersion: {
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
              [capiv1beta1.labelCluster]:
                machinePool.metadata.labels![capiv1beta1.labelCluster],
            },
          },
          namespace: nodePool.metadata.namespace,
        })
      );

      return machinePool;
    }

    // Azure (non-exp MachinePools)
    case kind === capiv1beta1.MachinePool &&
      apiVersion === capiv1beta1.ApiVersion: {
      const client = httpClientFactory();

      let machinePool = await capiv1beta1.getMachinePool(
        client,
        auth,
        nodePool.metadata.namespace!,
        nodePool.metadata.name
      );
      const description = capiv1beta1.getMachinePoolDescription(machinePool);
      if (description === newDescription) {
        return machinePool;
      }

      machinePool.metadata.annotations ??= {};
      machinePool.metadata.annotations[
        capiv1beta1.annotationMachinePoolDescription
      ] = newDescription;

      machinePool = await capiv1beta1.updateMachinePool(
        client,
        auth,
        machinePool
      );

      mutate(
        capiv1beta1.getMachinePoolKey(
          machinePool.metadata.namespace!,
          machinePool.metadata.name
        ),
        machinePool
      );

      mutate(
        capiv1beta1.getMachinePoolListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelClusterName]:
                machinePool.metadata.labels![capiv1beta1.labelClusterName],
            },
          },
          namespace: nodePool.metadata.namespace,
        })
      );

      return machinePool;
    }

    // AWS
    case kind === capiv1beta1.MachineDeployment: {
      let providerNodePool = await fetchProviderNodePoolForNodePool(
        httpClientFactory,
        auth,
        nodePool
      );

      if (providerNodePool?.kind !== infrav1alpha3.AWSMachineDeployment) {
        return Promise.reject(new Error('Unsupported provider.'));
      }

      const client = httpClientFactory();

      providerNodePool.spec.nodePool.description = newDescription;

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

      const nodePoolList = await capiv1beta1.getMachineDeploymentList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [infrav1alpha3.labelCluster]:
                nodePool.metadata.labels![infrav1alpha3.labelCluster],
            },
          },
          namespace: nodePool.metadata.namespace,
        }
      );

      nodePoolList.items = nodePoolList.items.sort(compareNodePools);

      mutate(
        fetchProviderNodePoolsForNodePoolsKey(nodePoolList.items),
        produce((draft?: IProviderNodePoolForNodePoolName[]) => {
          if (!draft) return;

          for (let i = 0; i < draft.length; i++) {
            if (draft[i]!.nodePoolName === providerNodePool!.metadata.name) {
              draft[i] = { ...draft[i], providerNodePool };
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
  const apiVersion = nodePool.apiVersion;
  const kind = nodePool.kind;

  switch (true) {
    // Azure
    case kind === capiexpv1alpha3.MachinePool &&
      apiVersion === capiexpv1alpha3.ApiVersion: {
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
              [capiv1beta1.labelCluster]:
                machinePool.metadata.labels![capiv1beta1.labelCluster],
            },
          },
          namespace: nodePool.metadata.namespace,
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

    // Azure (non-exp MachinePools)
    case kind === capiv1beta1.MachinePool &&
      apiVersion === capiv1beta1.ApiVersion: {
      const client = httpClientFactory();

      const machinePool = await capiv1beta1.getMachinePool(
        client,
        auth,
        nodePool.metadata.namespace!,
        nodePool.metadata.name
      );

      await capiv1beta1.deleteMachinePool(client, auth, machinePool);

      machinePool.metadata.deletionTimestamp = new Date().toISOString();

      mutate(
        capiv1beta1.getMachinePoolKey(
          machinePool.metadata.namespace!,
          machinePool.metadata.name
        ),
        machinePool,
        false
      );

      // Update the deleted machine pool in place.
      mutate(
        capiv1beta1.getMachinePoolListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelClusterName]:
                machinePool.metadata.labels![capiv1beta1.labelClusterName],
            },
          },
          namespace: nodePool.metadata.namespace,
        }),
        produce((draft?: capiv1beta1.IMachinePoolList) => {
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

    // AWS
    case kind === capiv1beta1.MachineDeployment: {
      const client = httpClientFactory();

      const machineDeployment = await capiv1beta1.getMachineDeployment(
        client,
        auth,
        nodePool.metadata.namespace!,
        nodePool.metadata.name
      );

      await capiv1beta1.deleteMachineDeployment(
        client,
        auth,
        machineDeployment
      );

      machineDeployment.metadata.deletionTimestamp = new Date().toISOString();

      mutate(
        capiv1beta1.getMachineDeploymentKey(
          machineDeployment.metadata.namespace!,
          machineDeployment.metadata.name
        ),
        machineDeployment,
        false
      );

      mutate(
        capiv1beta1.getMachineDeploymentListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelCluster]:
                machineDeployment.metadata.labels![capiv1beta1.labelCluster],
            },
          },
          namespace: nodePool.metadata.namespace,
        }),
        produce((draft?: capiv1beta1.IMachineDeploymentList) => {
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

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export async function deleteProviderNodePool(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePool: NodePool
) {
  let providerNodePool = await fetchProviderNodePoolForNodePool(
    httpClientFactory,
    auth,
    nodePool
  );

  switch (providerNodePool?.kind) {
    case infrav1alpha3.AWSMachineDeployment: {
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

      mutate<IProviderNodePoolForNodePoolName[]>(
        fetchProviderNodePoolsForNodePoolsKey([nodePool]),
        [{ nodePoolName: nodePool.metadata.name, providerNodePool }],
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

    const kind = nodePool.spec?.template.spec?.infrastructureRef?.kind;

    if (kind === infrav1alpha3.AWSMachineDeployment) {
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
): Promise<NodePool> {
  const kind = nodePool.kind;
  const apiVersion = nodePool.apiVersion;

  switch (true) {
    // Azure
    case kind === capiexpv1alpha3.MachinePool &&
      apiVersion === capiexpv1alpha3.ApiVersion: {
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
              [capiv1beta1.labelCluster]:
                machinePool.metadata.labels![capiv1beta1.labelCluster],
            },
          },
          namespace: nodePool.metadata.namespace,
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

    // Azure (non-exp MachinePools)
    case kind === capiv1beta1.MachinePool &&
      apiVersion === capiv1beta1.ApiVersion: {
      const client = httpClientFactory();

      let machinePool = await capiv1beta1.getMachinePool(
        client,
        auth,
        nodePool.metadata.namespace!,
        nodePool.metadata.name
      );

      if (
        nodePool.metadata.annotations?.[
          capiv1beta1.annotationMachinePoolMinSize
        ] === min.toString() &&
        nodePool.metadata.annotations?.[
          capiv1beta1.annotationMachinePoolMaxSize
        ] === max.toString()
      ) {
        return machinePool;
      }

      machinePool.metadata.annotations ??= {};
      machinePool.metadata.annotations[
        capiv1beta1.annotationMachinePoolMinSize
      ] = min.toString();
      machinePool.metadata.annotations[
        capiv1beta1.annotationMachinePoolMaxSize
      ] = max.toString();

      machinePool = await capiv1beta1.updateMachinePool(
        client,
        auth,
        machinePool
      );

      mutate(
        capiv1beta1.getMachinePoolKey(
          machinePool.metadata.namespace!,
          machinePool.metadata.name
        ),
        machinePool,
        false
      );

      // Update the updated machine pool in place.
      mutate(
        capiv1beta1.getMachinePoolListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelClusterName]:
                machinePool.metadata.labels![capiv1beta1.labelClusterName],
            },
          },
          namespace: nodePool.metadata.namespace,
        }),
        produce((draft?: capiv1beta1.IMachinePoolList) => {
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

    // AWS
    case kind === capiv1beta1.MachineDeployment: {
      let providerNodePool = await fetchProviderNodePoolForNodePool(
        httpClientFactory,
        auth,
        nodePool
      );

      if (providerNodePool?.kind !== infrav1alpha3.AWSMachineDeployment) {
        return Promise.reject(new Error('Unsupported provider.'));
      }

      const client = httpClientFactory();

      if (
        providerNodePool.spec.nodePool.scaling.min === min &&
        providerNodePool.spec.nodePool.scaling.max === max
      ) {
        return nodePool;
      }

      providerNodePool.spec.nodePool.scaling.min = min;
      providerNodePool.spec.nodePool.scaling.max = max;

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

      const nodePoolList = await capiv1beta1.getMachineDeploymentList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [infrav1alpha3.labelCluster]:
                nodePool.metadata.labels![infrav1alpha3.labelCluster],
            },
          },
          namespace: nodePool.metadata.namespace,
        }
      );

      nodePoolList.items = nodePoolList.items.sort(compareNodePools);

      mutate(
        fetchProviderNodePoolsForNodePoolsKey(nodePoolList.items),
        produce((draft?: IProviderNodePoolForNodePoolName[]) => {
          if (!draft) return;

          for (let i = 0; i < draft.length; i++) {
            if (draft[i]!.nodePoolName === providerNodePool!.metadata.name) {
              draft[i] = { ...draft[i], providerNodePool };
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
        [capiv1beta1.labelCluster]: config.clusterName,
        [capiv1beta1.labelClusterName]: config.clusterName,
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
    releaseVersion: string;
    azureOperatorVersion: string;
  }
) {
  switch (true) {
    case provider === Providers.AZURE &&
      compare(
        config.releaseVersion,
        Constants.AZURE_NON_EXP_MACHINE_POOLS_VERSION
      ) < 0:
      return createDefaultExpAzureMachinePool(config);
    case provider === Providers.AZURE:
      return createDefaultAzureMachinePool(config);
    case provider === Providers.AWS:
      return createDefaultAWSMachineDeployment(config);
    default:
      throw new Error('Unsupported provider.');
  }
}

export function createDefaultExpAzureMachinePool(config: {
  namespace: string;
  name: string;
  clusterName: string;
  organization: string;
  location: string;
  releaseVersion: string;
  azureOperatorVersion: string;
}): capzexpv1alpha3.IAzureMachinePool {
  return {
    apiVersion: capzexpv1alpha3.ApiVersion,
    kind: capzexpv1alpha3.AzureMachinePool,
    metadata: {
      namespace: config.namespace,
      name: config.name,
      labels: {
        [capiexpv1alpha3.labelMachinePool]: config.name,
        [capiv1beta1.labelCluster]: config.clusterName,
        [capiv1beta1.labelClusterName]: config.clusterName,
        [capiv1beta1.labelOrganization]: config.organization,
        [capiv1beta1.labelReleaseVersion]: config.releaseVersion,
        [capiexpv1alpha3.labelAzureOperatorVersion]:
          config.azureOperatorVersion,
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

export function createDefaultAzureMachinePool(config: {
  namespace: string;
  name: string;
  clusterName: string;
  organization: string;
  location: string;
  releaseVersion: string;
  azureOperatorVersion: string;
}): capzv1beta1.IAzureMachinePool {
  return {
    apiVersion: capzv1beta1.ApiVersion,
    kind: capzv1beta1.AzureMachinePool,
    metadata: {
      namespace: config.namespace,
      name: config.name,
      labels: {
        [capiv1beta1.labelMachinePool]: config.name,
        [capiv1beta1.labelCluster]: config.clusterName,
        [capiv1beta1.labelClusterName]: config.clusterName,
        [capiv1beta1.labelOrganization]: config.organization,
        [capiv1beta1.labelReleaseVersion]: config.releaseVersion,
        [capiv1beta1.labelAzureOperatorVersion]: config.azureOperatorVersion,
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
  const kind = config.providerNodePool?.kind;
  const apiVersion = config.providerNodePool?.apiVersion;

  switch (true) {
    // Azure
    case kind === capzexpv1alpha3.AzureMachinePool &&
      apiVersion === capzexpv1alpha3.ApiVersion:
      return createDefaultExpMachinePool(config);

    // Azure (non-exp MachinePools)
    case kind === capzv1beta1.AzureMachinePool &&
      apiVersion === capzv1beta1.ApiVersion:
      return createDefaultMachinePool(config);

    // AWS
    case kind === infrav1alpha3.AWSMachineDeployment:
      return createDefaultMachineDeployment(config);
    default:
      throw new Error('Unsupported provider.');
  }
}

function createDefaultExpMachinePool(config: {
  providerNodePool: ProviderNodePool;
  bootstrapConfig: BootstrapConfig;
}): capiexpv1alpha3.IMachinePool {
  const namespace = config.providerNodePool!.metadata.namespace;
  const name = config.providerNodePool!.metadata.name;
  const organization =
    config.providerNodePool!.metadata.labels![capiv1beta1.labelOrganization];
  const clusterName =
    config.providerNodePool!.metadata.labels![capiv1beta1.labelClusterName];
  const releaseVersion =
    config.providerNodePool!.metadata.labels![capiv1beta1.labelReleaseVersion];
  const azureOperatorVersion =
    config.providerNodePool!.metadata.labels![
      capiexpv1alpha3.labelAzureOperatorVersion
    ];

  return {
    apiVersion: capiexpv1alpha3.ApiVersion,
    kind: capiexpv1alpha3.MachinePool,
    metadata: {
      name,
      namespace,
      labels: {
        [capiexpv1alpha3.labelMachinePool]: name,
        [capiv1beta1.labelCluster]: clusterName,
        [capiv1beta1.labelClusterName]: clusterName,
        [capiv1beta1.labelOrganization]: organization,
        [capiv1beta1.labelReleaseVersion]: releaseVersion,
        [capiexpv1alpha3.labelAzureOperatorVersion]: azureOperatorVersion,
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

function createDefaultMachinePool(config: {
  providerNodePool: ProviderNodePool;
  bootstrapConfig: BootstrapConfig;
}): capiv1beta1.IMachinePool {
  const namespace = config.providerNodePool!.metadata.namespace;
  const name = config.providerNodePool!.metadata.name;
  const organization =
    config.providerNodePool!.metadata.labels![capiv1beta1.labelOrganization];
  const clusterName =
    config.providerNodePool!.metadata.labels![capiv1beta1.labelClusterName];
  const releaseVersion =
    config.providerNodePool!.metadata.labels![capiv1beta1.labelReleaseVersion];
  const azureOperatorVersion =
    config.providerNodePool!.metadata.labels![
      capiv1beta1.labelAzureOperatorVersion
    ];

  return {
    apiVersion: capiv1beta1.ApiVersion,
    kind: capiv1beta1.MachinePool,
    metadata: {
      name,
      namespace,
      labels: {
        [capiv1beta1.labelMachinePool]: name,
        [capiv1beta1.labelCluster]: clusterName,
        [capiv1beta1.labelClusterName]: clusterName,
        [capiv1beta1.labelOrganization]: organization,
        [capiv1beta1.labelReleaseVersion]: releaseVersion,
        [capiv1beta1.labelAzureOperatorVersion]: azureOperatorVersion,
      },
      annotations: {
        [capiv1beta1.annotationMachinePoolDescription]:
          Constants.DEFAULT_NODEPOOL_DESCRIPTION,
        [capiv1beta1.annotationMachinePoolMinSize]:
          Constants.NP_DEFAULT_MIN_SCALING.toString(),
        [capiv1beta1.annotationMachinePoolMaxSize]:
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
}): capiv1beta1.IMachineDeployment {
  const namespace = config.providerNodePool!.metadata.namespace;
  const name = config.providerNodePool!.metadata.name;
  const organization =
    config.providerNodePool!.metadata.labels![capiv1beta1.labelOrganization];
  const clusterName =
    config.providerNodePool!.metadata.labels![capiv1beta1.labelCluster];

  return {
    apiVersion: capiv1beta1.ApiVersion,
    kind: capiv1beta1.MachineDeployment,
    metadata: {
      name,
      namespace,
      labels: {
        [infrav1alpha3.labelMachineDeployment]: name,
        [capiv1beta1.labelCluster]: clusterName,
        [capiv1beta1.labelClusterName]: clusterName,
        [capiv1beta1.labelOrganization]: organization,
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

// eslint-disable-next-line complexity
export async function createNodePool(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  config: {
    nodePool: NodePool;
    providerNodePool: ProviderNodePool;
    bootstrapConfig: BootstrapConfig;
  },
  isRetrying: boolean
): Promise<{
  nodePool: NodePool;
  providerNodePool: ProviderNodePool;
  bootstrapConfig: BootstrapConfig;
}> {
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let nodePool: NodePool;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let providerNodePool: ProviderNodePool;
  // eslint-disable-next-line @typescript-eslint/init-declarations
  let bootstrapConfig: BootstrapConfig;

  const kind = config.providerNodePool?.kind;
  const apiVersion = config.providerNodePool?.apiVersion;

  switch (true) {
    // Azure
    case kind === capzexpv1alpha3.AzureMachinePool &&
      apiVersion === capzexpv1alpha3.ApiVersion: {
      if (config.bootstrapConfig && !isRetrying) {
        bootstrapConfig = await gscorev1alpha1.createSpark(
          httpClient,
          auth,
          config.bootstrapConfig
        );
      }

      try {
        providerNodePool = await capzexpv1alpha3.createAzureMachinePool(
          httpClient,
          auth,
          config.providerNodePool as capzexpv1alpha3.IAzureMachinePool
        );

        mutate(
          capzexpv1alpha3.getAzureMachinePoolKey(
            providerNodePool.metadata.namespace!,
            providerNodePool.metadata.name
          ),
          providerNodePool,
          false
        );
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        providerNodePool = await capzexpv1alpha3.getAzureMachinePool(
          httpClient,
          auth,
          config.providerNodePool!.metadata.namespace!,
          config.providerNodePool!.metadata.name
        );
      }

      try {
        nodePool = await capiexpv1alpha3.createMachinePool(
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
                [capiv1beta1.labelCluster]:
                  nodePool.metadata.labels![capiv1beta1.labelCluster],
              },
            },
            namespace: nodePool.metadata.namespace,
          }),
          produce((draft?: capiexpv1alpha3.IMachinePoolList) => {
            if (!draft) return;

            draft.items.push(nodePool as capiexpv1alpha3.IMachinePool);
            draft.items = draft.items.sort(compareNodePools);
          }),
          false
        );
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        nodePool = await capiexpv1alpha3.getMachinePool(
          httpClient,
          auth,
          config.nodePool.metadata.namespace!,
          config.nodePool.metadata.name
        );
      }

      return { nodePool, providerNodePool, bootstrapConfig };
    }

    // Azure (non-exp MachinePools)
    case kind === capzv1beta1.AzureMachinePool &&
      apiVersion === capzv1beta1.ApiVersion: {
      if (config.bootstrapConfig && !isRetrying) {
        bootstrapConfig = await gscorev1alpha1.createSpark(
          httpClient,
          auth,
          config.bootstrapConfig
        );
      }

      try {
        providerNodePool = await capzv1beta1.createAzureMachinePool(
          httpClient,
          auth,
          config.providerNodePool as capzv1beta1.IAzureMachinePool
        );

        mutate(
          capzv1beta1.getAzureMachinePoolKey(
            providerNodePool.metadata.namespace!,
            providerNodePool.metadata.name
          ),
          providerNodePool,
          false
        );
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        providerNodePool = await capzv1beta1.getAzureMachinePool(
          httpClient,
          auth,
          config.providerNodePool!.metadata.namespace!,
          config.providerNodePool!.metadata.name
        );
      }

      try {
        nodePool = await capiv1beta1.createMachinePool(
          httpClient,
          auth,
          config.nodePool as capiv1beta1.IMachinePool
        );

        mutate(
          capiv1beta1.getMachinePoolKey(
            nodePool.metadata.namespace!,
            nodePool.metadata.name
          ),
          nodePool,
          false
        );
        // Add the created node pool to the existing list.
        mutate(
          capiv1beta1.getMachinePoolListKey({
            labelSelector: {
              matchingLabels: {
                [capiv1beta1.labelClusterName]:
                  nodePool.metadata.labels![capiv1beta1.labelClusterName],
              },
            },
            namespace: nodePool.metadata.namespace,
          }),
          produce((draft?: capiv1beta1.IMachinePoolList) => {
            if (!draft) return;

            draft.items.push(nodePool as capiv1beta1.IMachinePool);
            draft.items = draft.items.sort(compareNodePools);
          }),
          false
        );
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        nodePool = await capiv1beta1.getMachinePool(
          httpClient,
          auth,
          config.nodePool.metadata.namespace!,
          config.nodePool.metadata.name
        );
      }

      return { nodePool, providerNodePool, bootstrapConfig };
    }

    // AWS
    case kind === infrav1alpha3.AWSMachineDeployment: {
      try {
        providerNodePool = await infrav1alpha3.createAWSMachineDeployment(
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
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        providerNodePool = await infrav1alpha3.getAWSMachineDeployment(
          httpClient,
          auth,
          config.providerNodePool!.metadata.namespace!,
          config.providerNodePool!.metadata.name
        );
      }

      try {
        nodePool = await capiv1beta1.createMachineDeployment(
          httpClient,
          auth,
          config.nodePool as capiv1beta1.IMachineDeployment
        );

        mutate(
          capiv1beta1.getMachineDeploymentKey(
            nodePool.metadata.namespace!,
            nodePool.metadata.name
          ),
          nodePool,
          false
        );

        // Add the created node pool to the existing list.
        mutate(
          capiv1beta1.getMachineDeploymentListKey({
            labelSelector: {
              matchingLabels: {
                [capiv1beta1.labelCluster]:
                  nodePool.metadata.labels![capiv1beta1.labelCluster],
              },
            },
            namespace: nodePool.metadata.namespace,
          }),
          produce((draft?: capiv1beta1.IMachineDeploymentList) => {
            if (!draft) return;

            draft.items.push(nodePool as capiv1beta1.IMachineDeployment);
            draft.items = draft.items.sort(compareNodePools);
          }),
          false
        );
      } catch (err) {
        if (
          !isRetrying ||
          !metav1.isStatusError(
            (err as GenericResponse).data,
            metav1.K8sStatusErrorReasons.AlreadyExists
          )
        ) {
          return Promise.reject(err);
        }
        nodePool = await capiv1beta1.getMachineDeployment(
          httpClient,
          auth,
          config.nodePool.metadata.namespace!,
          config.nodePool.metadata.name
        );
      }

      return { nodePool, providerNodePool, bootstrapConfig: undefined };
    }

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export interface IProviderNodePoolForNodePool {
  nodePool: NodePool;
  providerNodePool: ProviderNodePool | null;
}

export function mapNodePoolsToProviderNodePools(
  nodePools: NodePool[],
  providerNodePoolsForNodePoolNames: IProviderNodePoolForNodePoolName[]
): IProviderNodePoolForNodePool[] {
  const nodePoolNamesToProviderNodePools: Record<
    string,
    ProviderNodePool | null
  > = {};

  for (const {
    nodePoolName,
    providerNodePool,
  } of providerNodePoolsForNodePoolNames) {
    nodePoolNamesToProviderNodePools[nodePoolName] = providerNodePool ?? null;
  }

  const nodePoolsToProviderNodePools: IProviderNodePoolForNodePool[] =
    new Array(nodePools.length);

  for (let i = 0; i < nodePools.length; i++) {
    const nodePoolName = nodePools[i].metadata.name;

    const providerNodePool = nodePoolNamesToProviderNodePools.hasOwnProperty(
      nodePoolName
    )
      ? nodePoolNamesToProviderNodePools[nodePoolName]
      : undefined;

    nodePoolsToProviderNodePools[i] = {
      nodePool: nodePools[i],
      providerNodePool,
    };
  }

  return nodePoolsToProviderNodePools;
}

export function getCGroupsVersion(
  nodePool: NodePool,
  flatcarContainerLinuxVersion: string
): string {
  if (
    compare(
      flatcarContainerLinuxVersion,
      Constants.FLATCAR_CONTAINERLINUX_CGROUP_V2_VERSION
    ) < 0
  ) {
    return 'v1';
  }
  const hasCGroupV1Annotation = nodePool.metadata.annotations?.hasOwnProperty(
    capiv1beta1.annotationCGroupV1
  );

  return hasCGroupV1Annotation ? 'v1' : 'v2';
}
