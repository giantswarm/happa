import produce from 'immer';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { BootstrapConfig, NodePool, ProviderNodePool } from 'MAPI/types';
import { compareNodePools } from 'MAPI/utils';
import { IHttpClient } from 'model/clients/HttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as corev1 from 'model/services/mapi/corev1';
import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';
import * as metav1 from 'model/services/mapi/metav1';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { mutate } from 'swr';

export async function updateNodePoolDescription(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  nodePool: NodePool,
  newDescription: string
) {
  if (nodePool.kind === capiexpv1alpha3.MachinePool) {
    let machinePool = await capiexpv1alpha3.getMachinePool(
      httpClient,
      auth,
      nodePool.metadata.namespace!,
      nodePool.metadata.name
    );
    const description = capiexpv1alpha3.getMachinePoolDescription(machinePool);
    if (description === newDescription) {
      return machinePool;
    }

    machinePool.metadata.annotations ??= {};
    machinePool.metadata.annotations[
      capiexpv1alpha3.annotationMachinePoolDescription
    ] = newDescription;

    machinePool = await capiexpv1alpha3.updateMachinePool(
      httpClient,
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
            [capiv1alpha3.labelCluster]: machinePool.metadata.labels![
              capiv1alpha3.labelCluster
            ],
          },
        },
      })
    );

    return machinePool;
  }

  return Promise.reject(new Error('Unsupported provider.'));
}

export async function deleteNodePool(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  nodePool: NodePool
) {
  if (nodePool.kind === capiexpv1alpha3.MachinePool) {
    let machinePool = await capiexpv1alpha3.getMachinePool(
      httpClient,
      auth,
      nodePool.metadata.namespace!,
      nodePool.metadata.name
    );

    machinePool = await capiexpv1alpha3.deleteMachinePool(
      httpClient,
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

    // Update the deleted machine pool in place.
    mutate(
      capiexpv1alpha3.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: machinePool.metadata.labels![
              capiv1alpha3.labelCluster
            ],
          },
        },
      }),
      produce((draft: capiexpv1alpha3.IMachinePoolList) => {
        for (let i = 0; i < draft.items.length; i++) {
          if (draft.items[i].metadata.name === machinePool.metadata.name) {
            draft.items[i] = machinePool;
          }
        }

        draft.items = draft.items.sort(compareNodePools);

        return draft;
      }),
      false
    );

    return machinePool;
  }

  return Promise.reject(new Error('Unsupported provider.'));
}

export async function updateNodePoolScaling(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  nodePool: NodePool,
  min: number,
  max: number
) {
  if (nodePool.kind === capiexpv1alpha3.MachinePool) {
    let machinePool = await capiexpv1alpha3.getMachinePool(
      httpClient,
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
      httpClient,
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

    // Update the deleted machine pool in place.
    mutate(
      capiexpv1alpha3.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: machinePool.metadata.labels![
              capiv1alpha3.labelCluster
            ],
          },
        },
      }),
      produce((draft: capiexpv1alpha3.IMachinePoolList) => {
        for (let i = 0; i < draft.items.length; i++) {
          if (draft.items[i].metadata.name === machinePool.metadata.name) {
            draft.items[i] = machinePool;
          }
        }

        draft.items = draft.items.sort(compareNodePools);

        return draft;
      }),
      false
    );

    return machinePool;
  }

  return Promise.reject(new Error('Unsupported provider.'));
}

export function createDefaultBootstrapConfig(
  provider: PropertiesOf<typeof Providers>,
  config: {
    namespace: string;
    name: string;
    clusterName: string;
  }
) {
  if (provider === Providers.AZURE) {
    return createDefaultSpark(config);
  }

  throw new Error('Unsupported provider.');
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
  if (provider === Providers.AZURE) {
    return createDefaultAzureMachinePool(config);
  }

  throw new Error('Unsupported provider.');
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
        vmSize: 'Standard_D4s_v3',
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

export function createDefaultNodePool(config: {
  providerNodePool: ProviderNodePool;
  bootstrapConfig: BootstrapConfig;
}) {
  if (config.providerNodePool?.kind === capzexpv1alpha3.AzureMachinePool) {
    return createDefaultMachinePool(config);
  }

  throw new Error('Unsupported provider.');
}

function createDefaultMachinePool(config: {
  providerNodePool: ProviderNodePool;
  bootstrapConfig: BootstrapConfig;
}): capiexpv1alpha3.IMachinePool {
  const namespace = config.providerNodePool!.metadata.namespace;
  const name = config.providerNodePool!.metadata.name;
  const organization = config.providerNodePool!.metadata.labels![
    capiv1alpha3.labelOrganization
  ];
  const clusterName = config.providerNodePool!.metadata.labels![
    capiv1alpha3.labelClusterName
  ];

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
        [capiexpv1alpha3.annotationMachinePoolDescription]: 'Unnamed node pool',
      },
    },
    spec: {
      clusterName,
      template: {
        metadata: {} as metav1.IObjectMeta,
        spec: {
          clusterName,
          bootstrap: {
            configRef: corev1.getObjectReference(config.bootstrapConfig),
          },
          infrastructureRef: corev1.getObjectReference(
            config.providerNodePool!
          ),
        },
      },
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
  if (config.providerNodePool?.kind === capzexpv1alpha3.AzureMachinePool) {
    const bootstrapConfig = await gscorev1alpha1.createSpark(
      httpClient,
      auth,
      config.bootstrapConfig
    );

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
            [capiv1alpha3.labelCluster]: nodePool.metadata.labels![
              capiv1alpha3.labelCluster
            ],
          },
        },
      }),
      produce((draft: capiexpv1alpha3.IMachinePoolList) => {
        draft.items.push(nodePool);
        draft.items = draft.items.sort(compareNodePools);

        return draft;
      }),
      false
    );

    return { nodePool, providerNodePool, bootstrapConfig };
  }

  return Promise.reject(new Error('Unsupported provider.'));
}
