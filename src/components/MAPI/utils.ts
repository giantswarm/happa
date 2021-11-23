import { GenericResponse } from 'model/clients/GenericResponse';
import { Constants, Providers } from 'model/constants';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capiv1alpha4 from 'model/services/mapi/capiv1alpha4';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1alpha4 from 'model/services/mapi/capzv1alpha4';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import { compare } from 'utils/semver';

import {
  Cluster,
  ClusterList,
  ControlPlaneNode,
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

  switch (infrastructureRef.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
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

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
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

  switch (infrastructureRef.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
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

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
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

        case 'infrastructure.giantswarm.io/v1alpha2':
        case 'infrastructure.giantswarm.io/v1alpha3':
          return infrav1alpha3.getAWSMachineDeployment(
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
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  provider: PropertiesOf<typeof Providers>,
  namespace: string,
  name: string
): Promise<Cluster> {
  if (namespace && provider === Providers.AWS) {
    const [namespacedCluster, nonNamespacedCluster] = await Promise.allSettled([
      capiv1alpha3.getCluster(httpClientFactory(), auth, namespace, name),
      capiv1alpha3.getCluster(httpClientFactory(), auth, 'default', name),
    ]);

    if (namespacedCluster.status === 'fulfilled') {
      return namespacedCluster.value;
    }

    if (nonNamespacedCluster.status === 'fulfilled') {
      return nonNamespacedCluster.value;
    }

    return Promise.reject(nonNamespacedCluster.reason);
  }

  return capiv1alpha3.getCluster(httpClientFactory(), auth, namespace, name);
}

export function fetchClusterKey(
  _provider: PropertiesOf<typeof Providers>,
  namespace: string,
  name: string
): string {
  return capiv1alpha3.getClusterKey(namespace, name);
}

export async function fetchClusterList(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  provider: PropertiesOf<typeof Providers>,
  namespace?: string,
  organization?: string
): Promise<ClusterList> {
  if (namespace && organization && provider === Providers.AWS) {
    const [namespacedClusters, nonNamespacedClusters] =
      await Promise.allSettled([
        capiv1alpha3.getClusterList(httpClientFactory(), auth, { namespace }),
        capiv1alpha3.getClusterList(httpClientFactory(), auth, {
          namespace: 'default',
          labelSelector: {
            matchingLabels: { [capiv1alpha3.labelOrganization]: organization },
          },
        }),
      ]);

    if (
      namespacedClusters.status === 'rejected' &&
      nonNamespacedClusters.status === 'rejected'
    ) {
      return Promise.reject(nonNamespacedClusters.reason);
    }

    const clusterList: capiv1alpha3.IClusterList = {
      apiVersion: 'cluster.x-k8s.io/v1alpha3',
      kind: capiv1alpha3.ClusterList,
      metadata: {},
      items: [],
    };

    if (namespacedClusters.status === 'fulfilled') {
      clusterList.items.push(...namespacedClusters.value.items);
    }

    if (nonNamespacedClusters.status === 'fulfilled') {
      clusterList.items.push(...nonNamespacedClusters.value.items);
    }

    return clusterList;
  }

  const getOptions: capiv1alpha3.IGetClusterListOptions = { namespace };

  return capiv1alpha3.getClusterList(httpClientFactory(), auth, getOptions);
}

export function fetchClusterListKey(
  provider: PropertiesOf<typeof Providers>,
  namespace?: string,
  organization?: string
): string | null {
  if (typeof namespace === 'undefined') return null;

  const getOptions: capiv1alpha3.IGetClusterListOptions = { namespace };

  if (organization && provider === Providers.AWS) {
    getOptions.labelSelector = {
      matchingLabels: { [capiv1alpha3.labelOrganization]: organization },
    };
  }

  return capiv1alpha3.getClusterListKey(getOptions);
}

export async function fetchControlPlaneNodesForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1alpha3.ICluster
): Promise<ControlPlaneNode[]> {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  switch (infrastructureRef.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4': {
      const cpNodes = await capzv1alpha3.getAzureMachineList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [capiv1alpha3.labelCluster]: cluster.metadata.name,
              [capzv1alpha3.labelControlPlane]: 'true',
            },
          },
        }
      );

      return cpNodes.items;
    }

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3': {
      const [awsCP, g8sCP] = await Promise.allSettled([
        infrav1alpha3.getAWSControlPlaneList(httpClientFactory(), auth, {
          labelSelector: {
            matchingLabels: {
              [infrav1alpha3.labelCluster]: cluster.metadata.name,
            },
          },
        }),
        infrav1alpha3.getG8sControlPlaneList(httpClientFactory(), auth, {
          labelSelector: {
            matchingLabels: {
              [infrav1alpha3.labelCluster]: cluster.metadata.name,
            },
          },
        }),
      ]);

      if (awsCP.status === 'rejected' && g8sCP.status === 'rejected') {
        return Promise.reject(awsCP.reason);
      }

      const cpNodes: ControlPlaneNode[] = [];
      if (awsCP.status === 'fulfilled' && awsCP.value.items.length > 0) {
        cpNodes.push(awsCP.value.items[0]);
      }
      if (g8sCP.status === 'fulfilled' && g8sCP.value.items.length > 0) {
        cpNodes.push(g8sCP.value.items[0]);
      }

      return cpNodes;
    }

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export function fetchControlPlaneNodesForClusterKey(
  cluster: capiv1alpha3.ICluster
) {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return null;
  }

  switch (infrastructureRef.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return capzv1alpha3.getAzureMachineListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1alpha3.labelCluster]: cluster.metadata.name,
          },
        },
      });

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return infrav1alpha3.getAWSControlPlaneListKey({
        labelSelector: {
          matchingLabels: {
            [infrav1alpha3.labelCluster]: cluster.metadata.name,
          },
        },
      });

    default:
      return null;
  }
}

export async function fetchProviderClusterForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: Cluster
): Promise<ProviderCluster> {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  switch (infrastructureRef.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return capzv1alpha3.getAzureCluster(
        httpClientFactory(),
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return infrav1alpha3.getAWSCluster(
        httpClientFactory(),
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export function fetchProviderClusterForClusterKey(cluster: Cluster) {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) return null;

  switch (infrastructureRef.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return capzv1alpha3.getAzureClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return infrav1alpha3.getAWSClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    default:
      return null;
  }
}

export interface IProviderClusterForClusterName {
  clusterName: string;
  providerCluster: ProviderCluster;
}

export async function fetchProviderClustersForClusters(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clusters: Cluster[]
): Promise<IProviderClusterForClusterName[]> {
  return Promise.all(
    clusters.map(async (cluster) => {
      try {
        const providerCluster = await fetchProviderClusterForCluster(
          httpClientFactory,
          auth,
          cluster
        );

        return {
          clusterName: cluster.metadata.name,
          providerCluster,
        };
      } catch {
        return {
          clusterName: cluster.metadata.name,
          providerCluster: undefined,
        };
      }
    })
  );
}

export function fetchProviderClustersForClustersKey(clusters?: Cluster[]) {
  if (!clusters) return null;

  const keys = ['fetchProviderClustersForClusters/'];
  for (const cluster of clusters) {
    if (cluster.spec?.infrastructureRef) {
      keys.push(cluster.metadata.name);
    }
  }

  return keys.sort().join();
}

export function getNodePoolDescription(
  nodePool: NodePool,
  providerNodePool: ProviderNodePool | null,
  defaultValue = Constants.DEFAULT_NODEPOOL_DESCRIPTION
): string {
  switch (nodePool.apiVersion) {
    case 'exp.cluster.x-k8s.io/v1alpha3':
      return (
        nodePool.metadata.annotations?.[
          capiexpv1alpha3.annotationMachinePoolDescription
        ] || defaultValue
      );
    case 'cluster.x-k8s.io/v1alpha4':
      return (
        nodePool.metadata.annotations?.[
          capiv1alpha4.annotationMachinePoolDescription
        ] || defaultValue
      );
    case 'cluster.x-k8s.io/v1alpha3':
      if (
        providerNodePool?.apiVersion ===
          'infrastructure.giantswarm.io/v1alpha2' ||
        providerNodePool?.apiVersion === 'infrastructure.giantswarm.io/v1alpha3'
      ) {
        return providerNodePool.spec.nodePool.description || defaultValue;
      }

      return defaultValue;
    default:
      return defaultValue;
  }
}

export interface INodePoolMachineTypesAzure {
  primary: string;
}

export interface INodePoolMachineTypesAWS {
  primary: string;
  all: string[];
  similarInstances: boolean;
}

export type NodePoolMachineTypes =
  | INodePoolMachineTypesAzure
  | INodePoolMachineTypesAWS;

export function getProviderNodePoolMachineTypes(
  providerNodePool: ProviderNodePool
): NodePoolMachineTypes | undefined {
  switch (providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return { primary: providerNodePool.spec?.template.vmSize ?? '' };
    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return {
        primary: providerNodePool.spec.provider.worker.instanceType,
        all: providerNodePool.status?.provider?.worker?.instanceTypes ?? [
          providerNodePool.spec.provider.worker.instanceType,
        ],
        similarInstances:
          providerNodePool.spec.provider.worker.useAlikeInstanceTypes,
      };
    default:
      return undefined;
  }
}

export interface INodePoolSpotInstancesAzure {
  enabled: boolean;
  maxPrice: number;
}

export interface INodePoolSpotInstancesAWS {
  enabled: boolean;
  onDemandBaseCapacity: number;
  onDemandPercentageAboveBaseCapacity: number;
  nodeCount: number;
}

export type NodePoolSpotInstances =
  | INodePoolSpotInstancesAzure
  | INodePoolSpotInstancesAWS;

export function getProviderNodePoolSpotInstances(
  providerNodePool: ProviderNodePool
): NodePoolSpotInstances | undefined {
  switch (providerNodePool?.apiVersion) {
    case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4': {
      try {
        const maxPriceQty =
          providerNodePool.spec?.template.spotVMOptions?.maxPrice;
        const maxPrice = maxPriceQty
          ? metav1.quantityToScalar(maxPriceQty)
          : -1;

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
          maxPrice: -1,
        };
      }
    }

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3': {
      const onDemandBaseCapacity =
        providerNodePool.spec.provider.instanceDistribution
          ?.onDemandBaseCapacity ?? 0;
      const onDemandPercentageAboveBaseCapacity =
        providerNodePool.spec.provider.instanceDistribution
          ?.onDemandPercentageAboveBaseCapacity ?? 0;

      return {
        // eslint-disable-next-line no-magic-numbers
        enabled: onDemandPercentageAboveBaseCapacity < 100,
        onDemandBaseCapacity: onDemandBaseCapacity ?? 0,
        onDemandPercentageAboveBaseCapacity:
          onDemandPercentageAboveBaseCapacity ?? 0,
        nodeCount:
          providerNodePool.status?.provider?.worker?.spotInstances ?? 0,
      };
    }

    default:
      return undefined;
  }
}

interface INodesStatus {
  min: number;
  max: number;
  desired: number;
  current: number;
}

export function getNodePoolScaling(
  nodePool: NodePool,
  providerNodePool: ProviderNodePool | null
): INodesStatus {
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

      if (providerNodePool) {
        [status.min, status.max] = capzv1alpha4.getAzureMachinePoolScaling(
          providerNodePool as capzv1alpha4.IAzureMachinePool
        );
      }

      status.desired = nodePool.status?.replicas ?? -1;
      status.current = nodePool.status?.readyReplicas ?? -1;

      return status;
    }

    case 'cluster.x-k8s.io/v1alpha3': {
      if (
        providerNodePool?.apiVersion ===
          'infrastructure.giantswarm.io/v1alpha2' ||
        providerNodePool?.apiVersion === 'infrastructure.giantswarm.io/v1alpha3'
      ) {
        return {
          min: providerNodePool.spec.nodePool.scaling.min,
          max: providerNodePool.spec.nodePool.scaling.max,
          desired: nodePool.status?.replicas ?? -1,
          current: nodePool.status?.readyReplicas ?? -1,
        };
      }

      return { min: -1, max: -1, desired: -1, current: -1 };
    }

    default:
      return { min: -1, max: -1, desired: -1, current: -1 };
  }
}

export function getNodePoolAvailabilityZones(
  nodePool: NodePool,
  providerNodePool: ProviderNodePool
): string[] {
  switch (nodePool.apiVersion) {
    case 'exp.cluster.x-k8s.io/v1alpha3':
    case 'cluster.x-k8s.io/v1alpha4':
      return nodePool.spec?.failureDomains ?? [];
    case 'cluster.x-k8s.io/v1alpha3': {
      if (
        providerNodePool?.apiVersion ===
          'infrastructure.giantswarm.io/v1alpha2' ||
        providerNodePool?.apiVersion === 'infrastructure.giantswarm.io/v1alpha3'
      ) {
        return providerNodePool.spec.provider.availabilityZones;
      }

      return [];
    }
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

export function getClusterDescription(
  cluster: Cluster,
  providerCluster: ProviderCluster | null,
  defaultValue = Constants.DEFAULT_CLUSTER_DESCRIPTION
): string {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return defaultValue;
  }

  switch (infrastructureRef.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return (
        cluster.metadata.annotations?.[
          capiv1alpha3.annotationClusterDescription
        ] || defaultValue
      );
    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return (
        (providerCluster as infrav1alpha3.IAWSCluster)?.spec?.cluster
          .description ||
        cluster.metadata.annotations?.[
          capiv1alpha3.annotationClusterDescription
        ] ||
        defaultValue
      );
    default:
      return defaultValue;
  }
}

export function getProviderClusterLocation(
  providerCluster: ProviderCluster
): string | undefined {
  switch (providerCluster?.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
      return providerCluster.spec?.location ?? '';

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3': {
      const region = providerCluster.spec?.provider.region;
      if (typeof region === 'undefined') return '';

      return region;
    }

    default:
      return undefined;
  }
}

export function getProviderClusterAccountID(
  providerCluster: ProviderCluster
): string | undefined {
  switch (providerCluster?.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3': {
      const id = providerCluster.spec?.subscriptionID;
      if (typeof id === 'undefined') return '';

      return id;
    }

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3':
      return '';

    default:
      return undefined;
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

      if (azs.size === count) {
        return Array.from(azs).sort();
      }
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

export function supportsClientCertificates(cluster: Cluster): boolean {
  const infrastructureRef = cluster?.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return false;
  }

  switch (infrastructureRef.apiVersion) {
    case 'infrastructure.cluster.x-k8s.io/v1alpha3':
    case 'infrastructure.cluster.x-k8s.io/v1alpha4':
      return true;

    case 'infrastructure.giantswarm.io/v1alpha2':
    case 'infrastructure.giantswarm.io/v1alpha3': {
      const releaseVersion = getClusterReleaseVersion(cluster);
      if (!releaseVersion) return false;

      if (
        compare(releaseVersion, Constants.AWS_CLIENT_CERTIFICATES_VERSION) < 0
      ) {
        return false;
      }

      if (cluster.metadata.namespace === 'default') return false;

      return true;
    }

    default:
      return false;
  }
}

/**
 * Compute an organization namespace from the given organization name.
 * This also makes the org name follow the [DNS label standard](https://kubernetes.io/docs/concepts/overview/working-with-objects/names/#dns-label-names).
 * @param name
 */
export function getNamespaceFromOrgName(name: string): string {
  if (name.length < 1) return '';

  const prefix = 'org-';
  const nameChars = [];
  for (const char of name.toLowerCase()) {
    // Allow maximum 63 chars.
    // eslint-disable-next-line no-magic-numbers
    if (nameChars.length === 63 - prefix.length) break;

    if ((char >= '0' && char <= '9') || (char >= 'a' && char <= 'z')) {
      nameChars.push(char);
    } else if (
      nameChars.length > 0 &&
      nameChars[nameChars.length - 1] !== '-'
    ) {
      nameChars.push('-');
    }
  }

  if (nameChars.length < 1) return '';

  // Remove trailing `-` char if it exists.
  if (nameChars[nameChars.length - 1] === '-') {
    nameChars.pop();
  }

  return `org-${nameChars.join('')}`;
}
