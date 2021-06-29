import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';

import {
  ControlPlaneNodeList,
  NodePool,
  NodePoolList,
  ProviderCluster,
  ProviderNodePool,
} from './types';

export interface IMachineType {
  cpu: number;
  memory: number;
}

export function getMachineTypes(): Record<string, IMachineType> {
  const machineTypes: Record<string, IMachineType> = {};

  if (window.config.awsCapabilitiesJSON) {
    const rawCapabilities: Record<string, IRawAWSInstanceType> = JSON.parse(
      window.config.awsCapabilitiesJSON
    );

    for (const [name, properties] of Object.entries(rawCapabilities)) {
      machineTypes[name] = {
        cpu: properties.cpu_cores,
        memory: properties.memory_size_gb,
      };
    }
  }

  if (window.config.azureCapabilitiesJSON) {
    const rawCapabilities: Record<string, IRawAzureInstanceType> = JSON.parse(
      window.config.azureCapabilitiesJSON
    );

    for (const [name, properties] of Object.entries(rawCapabilities)) {
      machineTypes[name] = {
        cpu: properties.numberOfCores,
        // eslint-disable-next-line no-magic-numbers
        memory: properties.memoryInMb / 1000,
      };
    }
  }

  return machineTypes;
}

export function compareNodePools(a: NodePool, b: NodePool) {
  // Move node pools that are currently deleting to the end of the list.
  const aIsDeleting = typeof a.metadata.deletionTimestamp !== 'undefined';
  const bIsDeleting = typeof b.metadata.deletionTimestamp !== 'undefined';

  if (aIsDeleting && !bIsDeleting) {
    return 1;
  } else if (!aIsDeleting && bIsDeleting) {
    return -1;
  }

  if (
    a.kind === capiexpv1alpha3.MachinePool &&
    b.kind === capiexpv1alpha3.MachinePool
  ) {
    // Sort by description.
    const descriptionComparison = capiexpv1alpha3
      .getMachinePoolDescription(a)
      .localeCompare(capiexpv1alpha3.getMachinePoolDescription(b));
    if (descriptionComparison !== 0) {
      return descriptionComparison;
    }
  }

  // If descriptions are the same, sort by resource name.
  return a.metadata.name.localeCompare(b.metadata.name);
}

export async function fetchNodePoolListForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster?: capiv1alpha3.ICluster
): Promise<NodePoolList> {
  const infrastructureRef = cluster?.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  // eslint-disable-next-line @typescript-eslint/init-declarations
  let list: NodePoolList;

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      list = await capiexpv1alpha3.getMachinePoolList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelCluster]: cluster!.metadata.name,
            },
          },
        }
      );

      break;

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      list = await capiv1alpha3.getMachineDeploymentList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelCluster]: cluster!.metadata.name,
            },
          },
        }
      );

      break;

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }

  list.items = list.items.sort(compareNodePools);

  return list;
}

export function fetchNodePoolListForClusterKey(
  cluster?: capiv1alpha3.ICluster
) {
  const infrastructureRef = cluster?.spec?.infrastructureRef;
  if (
    !infrastructureRef ||
    typeof cluster?.metadata.deletionTimestamp !== 'undefined'
  ) {
    return null;
  }

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capiexpv1alpha3.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster!.metadata.name,
          },
        },
      });

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      return capiv1alpha3.getMachineDeploymentListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster!.metadata.name,
          },
        },
      });

    default:
      return null;
  }
}

export async function fetchProviderNodePoolsForNodePools(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePools: capiv1alpha3.IMachineDeployment[] | capiexpv1alpha3.IMachinePool[]
): Promise<ProviderNodePool[]> {
  const responses = await Promise.allSettled(
    nodePools.map(
      (np: capiv1alpha3.IMachineDeployment | capiexpv1alpha3.IMachinePool) => {
        const infrastructureRef = np.spec?.template.spec.infrastructureRef;
        if (!infrastructureRef) {
          return Promise.reject(
            new Error('There is no infrastructure reference defined.')
          );
        }

        switch (infrastructureRef.kind) {
          case capzexpv1alpha3.AzureMachinePool:
            return capzexpv1alpha3.getAzureMachinePool(
              httpClientFactory(),
              auth,
              np.metadata.namespace!,
              infrastructureRef.name
            );

          default:
            return Promise.reject(new Error('Unsupported provider.'));
        }
      }
    )
  );

  const providerNodePools: ProviderNodePool[] = responses.map((r) => {
    if (r.status === 'rejected') {
      return undefined;
    }

    return r.value;
  });

  return providerNodePools;
}

export function fetchProviderNodePoolsForNodePoolsKey(
  nodePools?: capiv1alpha3.IMachineDeployment[] | capiexpv1alpha3.IMachinePool[]
) {
  if (!nodePools) return null;

  const keys = ['fetchProviderNodePoolsForNodePools/'];
  for (const np of nodePools) {
    if (np.spec?.template.spec.infrastructureRef) {
      keys.push(np.metadata.name);
    }
  }

  return keys.join();
}

export async function fetchMasterListForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1alpha3.ICluster
): Promise<ControlPlaneNodeList> {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capzv1alpha3.getAzureMachineList(httpClientFactory(), auth, {
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster.metadata.name,
            [capzv1alpha3.labelControlPlane]: 'true',
          },
        },
      });

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export function fetchMasterListForClusterKey(cluster: capiv1alpha3.ICluster) {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return null;
  }

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capzv1alpha3.getAzureMachineListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster.metadata.name,
          },
        },
      });

    default:
      return null;
  }
}

export function fetchProviderClusterForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1alpha3.ICluster
) {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capzv1alpha3.getAzureCluster(
        httpClientFactory(),
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export function fetchProviderClusterForClusterKey(
  cluster: capiv1alpha3.ICluster
) {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) return null;

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capzv1alpha3.getAzureClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    default:
      return null;
  }
}

export function getNodePoolDescription(nodePool: NodePool): string {
  switch (nodePool.kind) {
    case capiexpv1alpha3.MachinePool:
      return capiexpv1alpha3.getMachinePoolDescription(nodePool);
    default:
      return 'Unnamed node pool';
  }
}

export function getProviderNodePoolMachineType(
  providerNodePool: ProviderNodePool
): string {
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool:
      return providerNodePool.spec?.template.vmSize ?? '';
    default:
      return '';
  }
}

interface INodesStatus {
  min: number;
  max: number;
  desired: number;
  current: number;
}

export function getNodePoolScaling(nodePool: NodePool): INodesStatus {
  switch (nodePool.kind) {
    case capiexpv1alpha3.MachinePool: {
      const status: INodesStatus = {
        min: -1,
        max: -1,
        desired: -1,
        current: -1,
      };

      [status.min, status.max] = capiexpv1alpha3.getMachinePoolScaling(
        nodePool
      );

      status.desired = nodePool.status?.replicas ?? -1;
      status.current = nodePool.status?.readyReplicas ?? -1;

      return status;
    }

    default:
      return { min: -1, max: -1, desired: -1, current: -1 };
  }
}

export function getNodePoolAvailabilityZones(nodePool: NodePool): string[] {
  switch (nodePool.kind) {
    case capiexpv1alpha3.MachinePool:
      return nodePool.spec?.failureDomains ?? [];
    default:
      return [];
  }
}

export function getProviderClusterLocation(
  providerCluster: ProviderCluster
): string {
  switch (providerCluster?.kind) {
    case capzv1alpha3.AzureCluster:
      return providerCluster.spec?.location ?? '';
    default:
      return '';
  }
}

export function getProviderNodePoolLocation(
  providerNodePool: ProviderNodePool
): string {
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool:
      return providerNodePool.spec?.location ?? '';
    default:
      return '';
  }
}

const uidRegexp = /^[a-z]([a-z][0-9]|[0-9][a-z])+$/;
const supportedUIDChars = '023456789abcdefghijkmnopqrstuvwxyz';

/**
 * Generate unique resource names, that can be used for node pool or cluster names.
 * @param length
 */
export function generateUID(length: number): string {
  const id = new Array(length);

  for (;;) {
    for (let i = 0; i < id.length; i++) {
      const nextCharIdx = Math.ceil(
        (supportedUIDChars.length - 1) * Math.random()
      );

      id[i] = supportedUIDChars[nextCharIdx];
    }

    const idString = id.join('');
    if (!uidRegexp.test(idString)) {
      continue;
    }

    return idString;
  }
}
