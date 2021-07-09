import ErrorReporter from 'lib/errors/ErrorReporter';
import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as metav1 from 'model/services/mapi/metav1';
import { Constants, Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { IState } from 'stores/state';

import {
  Cluster,
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

export async function fetchCluster(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  _provider: PropertiesOf<typeof Providers>,
  namespace: string,
  name: string
): Promise<Cluster> {
  return capiv1alpha3.getCluster(httpClient, auth, namespace, name);
}

export function fetchClusterKey(
  _provider: PropertiesOf<typeof Providers>,
  namespace: string,
  name: string
): string {
  return capiv1alpha3.getClusterKey(namespace, name);
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
      return Constants.DEFAULT_NODEPOOL_DESCRIPTION;
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

export interface INodePoolSpotInstancesAzure {
  enabled: boolean;
  maxPrice: number;
}

export interface INodePoolSpotInstancesAWS {
  enabled: boolean;
}

export type NodePoolSpotInstances =
  | INodePoolSpotInstancesAzure
  | INodePoolSpotInstancesAWS;

export function getProviderNodePoolSpotInstances(
  providerNodePool: ProviderNodePool
): INodePoolSpotInstancesAzure | INodePoolSpotInstancesAWS {
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool: {
      try {
        const maxPriceQty =
          providerNodePool.spec?.template.spotVMOptions?.maxPrice;
        const maxPrice = maxPriceQty ? metav1.quantityToScalar(maxPriceQty) : 0;

        return {
          enabled:
            typeof providerNodePool.spec?.template.spotVMOptions !==
            'undefined',
          maxPrice: maxPrice as number,
        };
      } catch (err) {
        ErrorReporter.getInstance().notify(err);

        return {
          enabled:
            typeof providerNodePool.spec?.template.spotVMOptions !==
            'undefined',
          maxPrice: 0,
        };
      }
    }
    default:
      return {
        enabled: false,
      };
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

export function getClusterReleaseVersion(cluster: Cluster) {
  switch (cluster.apiVersion) {
    case 'cluster.x-k8s.io/v1alpha3':
      return capiv1alpha3.getReleaseVersion(cluster);
    default:
      return undefined;
  }
}

export function getClusterDescription(cluster: Cluster): string {
  switch (cluster.kind) {
    case capiv1alpha3.Cluster:
      return capiv1alpha3.getClusterDescription(cluster);
    default:
      return Constants.DEFAULT_CLUSTER_DESCRIPTION;
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

// TODO(axbarsan): Get this info from the environment, rather than the info response.
export function getSupportedAvailabilityZones(
  state: IState
): {
  minCount: number;
  maxCount: number;
  defaultCount: number;
  all: string[];
} {
  const zonesStats = state.main.info.general.availability_zones;

  return {
    minCount: 1,
    maxCount: zonesStats?.max ?? 1,
    defaultCount: zonesStats?.default ?? 1,
    all: zonesStats?.zones ?? [],
  };
}

/**
 * Determine a random list list of availability zones,
 * based on a given collection of available zones and
 * a required number of elements.
 * @param count - The maximum number of zones.
 * @param fromList - The available zones.
 * @param existing - Some zones that must be included in the output.
 */
export function determineRandomAZs(
  count: number,
  fromList: string[],
  existing?: string[]
): string[] {
  if (fromList.length < 1 || count < 1 || Number.isNaN(count)) {
    return [];
  } else if (fromList.length <= count) {
    return fromList.slice().sort();
  }

  const available = new Set(fromList);
  const azs = new Set<string>();

  if (existing) {
    for (const entry of existing) {
      if (available.has(entry)) {
        azs.add(entry);
      }
    }

    if (azs.size === count) {
      return Array.from(azs).sort();
    }
  }

  for (;;) {
    const nextAz = fromList[Math.ceil((fromList.length - 1) * Math.random())];
    if (azs.has(nextAz)) continue;

    azs.add(nextAz);

    if (azs.size === count) {
      return Array.from(azs).sort();
    }
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
