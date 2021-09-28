import ErrorReporter from 'lib/errors/ErrorReporter';
import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { compare } from 'lib/semver';
import { GenericResponse } from 'model/clients/GenericResponse';
import { IHttpClient } from 'model/clients/HttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capiv1alpha4 from 'model/services/mapi/capiv1alpha4';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1alpha4 from 'model/services/mapi/capzv1alpha4';
import * as metav1 from 'model/services/mapi/metav1';
import { Constants, Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';

import {
  Cluster,
  ClusterList,
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
    a.apiVersion === 'exp.cluster.x-k8s.io/v1alpha3' &&
    a.apiVersion === b.apiVersion
  ) {
    // Sort by description.
    const descriptionComparison = capiexpv1alpha3
      .getMachinePoolDescription(a)
      .localeCompare(capiexpv1alpha3.getMachinePoolDescription(b));
    if (descriptionComparison !== 0) {
      return descriptionComparison;
    }
  }

  if (
    a.apiVersion === 'cluster.x-k8s.io/v1alpha4' &&
    a.apiVersion === b.apiVersion
  ) {
    // Sort by description.
    const descriptionComparison = capiv1alpha4
      .getMachinePoolDescription(a)
      .localeCompare(capiv1alpha4.getMachinePoolDescription(b));
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
      if (isCAPZCluster(cluster)) {
        list = await capiv1alpha4.getMachinePoolList(
          httpClientFactory(),
          auth,
          {
            labelSelector: {
              matchingLabels: {
                [capiv1alpha4.labelClusterName]: cluster.metadata.name,
              },
            },
          }
        );
      } else {
        list = await capiexpv1alpha3.getMachinePoolList(
          httpClientFactory(),
          auth,
          {
            labelSelector: {
              matchingLabels: {
                [capiv1alpha3.labelCluster]: cluster.metadata.name,
              },
            },
          }
        );
      }

      break;

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      list = await capiv1alpha3.getMachineDeploymentList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelCluster]: cluster.metadata.name,
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
      if (isCAPZCluster(cluster)) {
        return capiv1alpha4.getMachinePoolListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1alpha4.labelClusterName]: cluster.metadata.name,
            },
          },
        });
      }

      return capiexpv1alpha3.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster.metadata.name,
          },
        },
      });

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      return capiv1alpha3.getMachineDeploymentListKey({
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

export async function fetchProviderNodePoolsForNodePools(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePools: NodePool[]
): Promise<ProviderNodePool[]> {
  const responses = await Promise.allSettled(
    nodePools.map((np: NodePool) => {
      const infrastructureRef = np.spec?.template.spec?.infrastructureRef;
      if (!infrastructureRef) {
        return Promise.reject(
          new Error('There is no infrastructure reference defined.')
        );
      }

      switch (infrastructureRef.apiVersion) {
        case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
          return capzexpv1alpha3.getAzureMachinePool(
            httpClientFactory(),
            auth,
            np.metadata.namespace!,
            infrastructureRef.name
          );

        case 'infrastructure.cluster.x-k8s.io/v1alpha4':
          return capzv1alpha4.getAzureMachinePool(
            httpClientFactory(),
            auth,
            np.metadata.namespace!,
            infrastructureRef.name
          );

        default:
          return Promise.reject(new Error('Unsupported provider.'));
      }
    })
  );

  const providerNodePools: ProviderNodePool[] = responses.map((r) => {
    if (r.status === 'rejected') {
      return undefined;
    }

    return r.value;
  });

  return providerNodePools;
}

export function fetchProviderNodePoolsForNodePoolsKey(nodePools?: NodePool[]) {
  if (!nodePools) return null;

  const keys = ['fetchProviderNodePoolsForNodePools/'];
  for (const np of nodePools) {
    if (np.spec?.template.spec?.infrastructureRef) {
      keys.push(np.metadata.name);
    }
  }

  return keys.sort().join();
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

export async function fetchClusterList(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  _provider: PropertiesOf<typeof Providers>,
  namespace?: string
): Promise<ClusterList> {
  const getOptions: capiv1alpha3.IGetClusterListOptions = { namespace };

  return capiv1alpha3.getClusterList(httpClient, auth, getOptions);
}

export function fetchClusterListKey(
  _provider: PropertiesOf<typeof Providers>,
  namespace?: string
): string | null {
  if (typeof namespace === 'undefined') return null;

  const getOptions: capiv1alpha3.IGetClusterListOptions = { namespace };

  return capiv1alpha3.getClusterListKey(getOptions);
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
  switch (nodePool.apiVersion) {
    case 'exp.cluster.x-k8s.io/v1alpha3':
      return capiexpv1alpha3.getMachinePoolDescription(nodePool);
    case 'cluster.x-k8s.io/v1alpha4':
      return capiv1alpha4.getMachinePoolDescription(nodePool);
    default:
      return Constants.DEFAULT_NODEPOOL_DESCRIPTION;
  }
}

export function getProviderNodePoolMachineType(
  providerNodePool: ProviderNodePool
): string {
  switch (providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
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
  switch (providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4': {
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
        ErrorReporter.getInstance().notify(err as Error);

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
  switch (nodePool.apiVersion) {
    case 'exp.cluster.x-k8s.io/v1alpha3': {
      const status: INodesStatus = {
        min: -1,
        max: -1,
        desired: -1,
        current: -1,
      };

      [status.min, status.max] =
        capiexpv1alpha3.getMachinePoolScaling(nodePool);

      status.desired = nodePool.status?.replicas ?? -1;
      status.current = nodePool.status?.readyReplicas ?? -1;

      return status;
    }

    case 'cluster.x-k8s.io/v1alpha4': {
      const status: INodesStatus = {
        min: -1,
        max: -1,
        desired: -1,
        current: -1,
      };

      [status.min, status.max] = capiv1alpha4.getMachinePoolScaling(nodePool);

      status.desired = nodePool.status?.replicas ?? -1;
      status.current = nodePool.status?.readyReplicas ?? -1;

      return status;
    }

    default:
      return { min: -1, max: -1, desired: -1, current: -1 };
  }
}

export function getNodePoolAvailabilityZones(nodePool: NodePool): string[] {
  switch (nodePool.apiVersion) {
    case 'exp.cluster.x-k8s.io/v1alpha3':
    case 'cluster.x-k8s.io/v1alpha4':
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
  switch (providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return providerNodePool.spec?.location ?? '';
    default:
      return '';
  }
}

export function getSupportedAvailabilityZones(): {
  minCount: number;
  maxCount: number;
  defaultCount: number;
  all: string[];
} {
  return {
    minCount: 1,
    maxCount: window.config.info.general.availabilityZones.max,
    defaultCount: window.config.info.general.availabilityZones.default,
    all: window.config.info.general.availabilityZones.zones,
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

/**
 * Extract the error message from a K8s API response.
 * @param fromErr
 * @param fallback - What message to return if the message
 * could not be extracted.
 */
export function extractErrorMessage(
  fromErr: unknown,
  fallback = 'Something went wrong'
): string {
  if (!fromErr) return '';

  let message = '';

  if (metav1.isStatus((fromErr as GenericResponse).data)) {
    message =
      (fromErr as GenericResponse<metav1.IK8sStatus>).data.message ?? '';
  } else if (fromErr instanceof Error) {
    message = fromErr.message;
  }

  message ||= fallback;

  return message;
}

export function getK8sAPIUrl(): string {
  const audienceURL = new URL(window.config.audience);
  // Remove all characters until the first `.`.
  audienceURL.host = audienceURL.host.substring(
    audienceURL.host.indexOf('.') + 1
  );

  return audienceURL.toString();
}

export function isCAPZCluster(cluster: Cluster): boolean {
  if (cluster.spec?.infrastructureRef?.kind !== capzv1alpha3.AzureCluster) {
    return false;
  }

  const releaseVersion = capiv1alpha3.getReleaseVersion(cluster);
  if (!releaseVersion) return false;

  return compare(releaseVersion, Constants.AZURE_CAPZ_VERSION) >= 0;
}

export function isNodePoolMngmtReadOnly(cluster: Cluster): boolean {
  return isCAPZCluster(cluster);
}
