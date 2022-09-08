import { GenericResponse } from 'model/clients/GenericResponse';
import { Constants, Providers } from 'model/constants';
import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
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

  if (window.config.gcpCapabilitiesJSON) {
    const rawCapabilities: Record<string, IRawGCPInstanceType> = JSON.parse(
      window.config.gcpCapabilitiesJSON
    );

    for (const [name, properties] of Object.entries(rawCapabilities)) {
      machineTypes[name] = {
        cpu: properties.guestCpus,
        // eslint-disable-next-line no-magic-numbers
        memory: properties.memoryMb / 1000,
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
    a.kind === capiv1beta1.MachinePool &&
    a.kind === b.kind &&
    a.apiVersion === 'cluster.x-k8s.io/v1beta1' &&
    a.apiVersion === b.apiVersion
  ) {
    // Sort by description.
    const descriptionComparison = capiv1beta1
      .getMachinePoolDescription(a)
      .localeCompare(capiv1beta1.getMachinePoolDescription(b));
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
  cluster?: capiv1beta1.ICluster,
  namespace?: string
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
    case capgv1beta1.GCPCluster:
      list = await capiv1beta1.getMachineDeploymentList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelClusterName]: cluster.metadata.name,
              [`${capiv1beta1.labelRole}!`]: 'bastion',
            },
          },
          namespace,
        }
      );

      break;

    case capzv1beta1.AzureCluster:
      if (supportsNonExpMachinePools(cluster)) {
        list = await capiv1beta1.getMachinePoolList(httpClientFactory(), auth, {
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelClusterName]: cluster.metadata.name,
            },
          },
          namespace,
        });
      } else {
        list = await capiexpv1alpha3.getMachinePoolList(
          httpClientFactory(),
          auth,
          {
            labelSelector: {
              matchingLabels: {
                [capiv1beta1.labelCluster]: cluster.metadata.name,
              },
            },
            namespace,
          }
        );
      }

      break;

    case infrav1alpha3.AWSCluster:
      list = await capiv1beta1.getMachineDeploymentList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelCluster]: cluster.metadata.name,
            },
          },
          namespace,
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
  cluster?: capiv1beta1.ICluster,
  namespace?: string
) {
  const infrastructureRef = cluster?.spec?.infrastructureRef;
  if (
    !infrastructureRef ||
    typeof cluster?.metadata.deletionTimestamp !== 'undefined'
  ) {
    return null;
  }

  switch (infrastructureRef.kind) {
    case capgv1beta1.GCPCluster:
      return capiv1beta1.getMachineDeploymentListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelClusterName]: cluster.metadata.name,
            [`${capiv1beta1.labelRole}!`]: 'bastion',
          },
        },
        namespace,
      });

    case capzv1beta1.AzureCluster:
      if (supportsNonExpMachinePools(cluster)) {
        return capiv1beta1.getMachinePoolListKey({
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelClusterName]: cluster.metadata.name,
            },
          },
          namespace,
        });
      }

      return capiexpv1alpha3.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelCluster]: cluster.metadata.name,
          },
        },
        namespace,
      });

    case infrav1alpha3.AWSCluster:
      return capiv1beta1.getMachineDeploymentListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelCluster]: cluster.metadata.name,
          },
        },
        namespace,
      });

    default:
      return null;
  }
}

export async function fetchProviderNodePoolForNodePool(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePool: NodePool
): Promise<ProviderNodePool> {
  const infrastructureRef = nodePool.spec?.template.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  const apiVersion = infrastructureRef.apiVersion;
  const kind = infrastructureRef.kind;

  switch (true) {
    case kind === capgv1beta1.GCPMachineTemplate:
      return capgv1beta1.getGCPMachineTemplate(
        httpClientFactory(),
        auth,
        nodePool.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capzexpv1alpha3.AzureMachinePool &&
      apiVersion === 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
      return capzexpv1alpha3.getAzureMachinePool(
        httpClientFactory(),
        auth,
        nodePool.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capzv1beta1.AzureMachinePool &&
      apiVersion === 'infrastructure.cluster.x-k8s.io/v1beta1':
      return capzv1beta1.getAzureMachinePool(
        httpClientFactory(),
        auth,
        nodePool.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === infrav1alpha3.AWSMachineDeployment:
      return infrav1alpha3.getAWSMachineDeployment(
        httpClientFactory(),
        auth,
        nodePool.metadata.namespace!,
        infrastructureRef.name
      );

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export interface IProviderNodePoolForNodePoolName {
  nodePoolName: string;
  providerNodePool: ProviderNodePool;
}

export async function fetchProviderNodePoolsForNodePools(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePools: NodePool[]
): Promise<IProviderNodePoolForNodePoolName[]> {
  return Promise.all(
    nodePools.map(async (nodePool) => {
      try {
        const providerNodePool = await fetchProviderNodePoolForNodePool(
          httpClientFactory,
          auth,
          nodePool
        );

        return {
          nodePoolName: nodePool.metadata.name,
          providerNodePool,
        };
      } catch {
        return {
          nodePoolName: nodePool.metadata.name,
          providerNodePool: undefined,
        };
      }
    })
  );
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
      capiv1beta1.getCluster(httpClientFactory(), auth, namespace, name),
      capiv1beta1.getCluster(httpClientFactory(), auth, 'default', name),
    ]);

    if (namespacedCluster.status === 'fulfilled') {
      return namespacedCluster.value;
    }

    if (nonNamespacedCluster.status === 'fulfilled') {
      return nonNamespacedCluster.value;
    }

    return Promise.reject(nonNamespacedCluster.reason);
  }

  return capiv1beta1.getCluster(httpClientFactory(), auth, namespace, name);
}

export function fetchClusterKey(
  _provider: PropertiesOf<typeof Providers>,
  namespace: string,
  name: string
): string {
  return capiv1beta1.getClusterKey(namespace, name);
}

export async function fetchClusterList(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  provider: PropertiesOf<typeof Providers>,
  namespace?: string,
  organization?: IOrganization
): Promise<ClusterList> {
  if (namespace && organization && provider === Providers.AWS) {
    const requests = [
      capiv1beta1.getClusterList(httpClientFactory(), auth, { namespace }),
    ];

    if (organization?.name) {
      requests.push(
        capiv1beta1.getClusterList(httpClientFactory(), auth, {
          namespace: 'default',
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelOrganization]: organization.name,
            },
          },
        })
      );
    }
    if (organization?.id) {
      requests.push(
        capiv1beta1.getClusterList(httpClientFactory(), auth, {
          namespace: 'default',
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelOrganization]: organization.id,
            },
          },
        })
      );
    }

    const responses = await Promise.allSettled(requests);

    const clusterList: capiv1beta1.IClusterList = {
      apiVersion: 'cluster.x-k8s.io/v1beta1',
      kind: capiv1beta1.ClusterList,
      metadata: {},
      items: [],
    };

    const rejectedResponses: PromiseRejectedResult[] = [];

    for (const response of responses) {
      if (response.status === 'rejected') {
        rejectedResponses.push(response);

        continue;
      }
      clusterList.items.push(...response.value.items);
    }

    if (rejectedResponses.length === responses.length) {
      return Promise.reject(rejectedResponses[0].reason);
    }

    return clusterList;
  }

  const getOptions: capiv1beta1.IGetClusterListOptions = { namespace };

  return capiv1beta1.getClusterList(httpClientFactory(), auth, getOptions);
}

export function fetchClusterListKey(
  provider: PropertiesOf<typeof Providers>,
  namespace?: string,
  organization?: IOrganization
): string | null {
  if (typeof namespace === 'undefined') return null;

  const getOptions: capiv1beta1.IGetClusterListOptions = { namespace };

  if (organization && provider === Providers.AWS) {
    getOptions.labelSelector = {
      matchingLabels: { [capiv1beta1.labelOrganization]: organization.id },
    };
  }

  return capiv1beta1.getClusterListKey(getOptions);
}

export async function fetchControlPlaneNodesForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1beta1.ICluster
): Promise<ControlPlaneNode[]> {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  switch (infrastructureRef.kind) {
    case capgv1beta1.GCPCluster: {
      const [gcpCP, machineCP] = await Promise.allSettled([
        capgv1beta1.getGCPMachineTemplateList(httpClientFactory(), auth, {
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelClusterName]: cluster.metadata.name,
              [capiv1beta1.labelRole]: 'control-plane',
            },
          },
          namespace: cluster.metadata.namespace,
        }),
        capiv1beta1.getMachineList(httpClientFactory(), auth, {
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelClusterName]: cluster.metadata.name,
              [capiv1beta1.labelMachineControlPlane]: '',
            },
          },
          namespace: cluster.metadata.namespace,
        }),
      ]);

      if (gcpCP.status === 'rejected' && machineCP.status === 'rejected') {
        return Promise.reject(gcpCP.reason);
      }

      let cpNodes: ControlPlaneNode[] = [];
      if (gcpCP.status === 'fulfilled' && gcpCP.value.items.length > 0) {
        cpNodes = [
          ...cpNodes,
          gcpCP.value.items.sort(
            (a, b) =>
              new Date(a.metadata.creationTimestamp ?? 0).getTime() -
              new Date(b.metadata.creationTimestamp ?? 0).getTime()
          )[0],
        ];
      }
      if (
        machineCP.status === 'fulfilled' &&
        machineCP.value.items.length > 0
      ) {
        cpNodes = [...cpNodes, ...machineCP.value.items];
      }

      return cpNodes;
    }

    case capzv1beta1.AzureCluster: {
      const cpNodes = await capzv1beta1.getAzureMachineList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelCluster]: cluster.metadata.name,
              [capzv1beta1.labelControlPlane]: 'true',
            },
          },
          namespace: cluster.metadata.namespace,
        }
      );

      return cpNodes.items;
    }

    case infrav1alpha3.AWSCluster: {
      const [awsCP, g8sCP] = await Promise.allSettled([
        infrav1alpha3.getAWSControlPlaneList(httpClientFactory(), auth, {
          labelSelector: {
            matchingLabels: {
              [infrav1alpha3.labelCluster]: cluster.metadata.name,
            },
          },
          namespace: cluster.metadata.namespace,
        }),
        infrav1alpha3.getG8sControlPlaneList(httpClientFactory(), auth, {
          labelSelector: {
            matchingLabels: {
              [infrav1alpha3.labelCluster]: cluster.metadata.name,
            },
          },
          namespace: cluster.metadata.namespace,
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
  cluster: capiv1beta1.ICluster
) {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return null;
  }

  switch (infrastructureRef.kind) {
    case capgv1beta1.GCPCluster:
      return capgv1beta1.getGCPMachineTemplateListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelCluster]: cluster.metadata.name,
            [capiv1beta1.labelRole]: 'control-plane',
          },
        },
        namespace: cluster.metadata.namespace,
      });

    case capzv1beta1.AzureCluster:
      return capzv1beta1.getAzureMachineListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelCluster]: cluster.metadata.name,
          },
        },
        namespace: cluster.metadata.namespace,
      });

    case infrav1alpha3.AWSCluster:
      return infrav1alpha3.getAWSControlPlaneListKey({
        labelSelector: {
          matchingLabels: {
            [infrav1alpha3.labelCluster]: cluster.metadata.name,
          },
        },
        namespace: cluster.metadata.namespace,
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

  switch (infrastructureRef.kind) {
    case capgv1beta1.GCPCluster:
      return capgv1beta1.getGCPCluster(
        httpClientFactory(),
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case capzv1beta1.AzureCluster:
      return capzv1beta1.getAzureCluster(
        httpClientFactory(),
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case infrav1alpha3.AWSCluster:
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

  switch (infrastructureRef.kind) {
    case capgv1beta1.GCPCluster:
      return capgv1beta1.getGCPClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case capzv1beta1.AzureCluster:
      return capzv1beta1.getAzureClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case infrav1alpha3.AWSCluster:
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
      } catch (err) {
        if ((err as Error).message.includes('Unsupported provider')) {
          return Promise.reject((err as Error).message);
        }

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
  defaultValue: string = Constants.DEFAULT_NODEPOOL_DESCRIPTION
): string {
  const kind = nodePool.kind;
  const providerNodePoolKind = providerNodePool?.kind;

  switch (true) {
    // Azure
    case kind === capiv1beta1.MachinePool:
      return (
        nodePool.metadata.annotations?.[
          capiv1beta1.annotationMachinePoolDescription
        ] || defaultValue
      );

    // AWS
    case kind === capiv1beta1.MachineDeployment &&
      providerNodePoolKind === infrav1alpha3.AWSMachineDeployment:
      return (
        (providerNodePool as infrav1alpha3.IAWSMachineDeployment)?.spec.nodePool
          .description || defaultValue
      );

    // GCP
    case kind === capiv1beta1.MachineDeployment:
      return (
        nodePool.metadata.annotations?.[
          capiv1beta1.annotationMachineDeploymentDescription
        ] || defaultValue
      );

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
  switch (providerNodePool?.kind) {
    case capgv1beta1.GCPMachineTemplate:
      return {
        primary: providerNodePool.spec?.template.spec.instanceType ?? '',
      };
    case capzv1beta1.AzureMachinePool:
      return { primary: providerNodePool.spec?.template.vmSize ?? '' };
    case infrav1alpha3.AWSMachineDeployment:
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
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool:
    case capzv1beta1.AzureMachinePool: {
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

    case infrav1alpha3.AWSMachineDeployment: {
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
  const kind = nodePool.kind;
  const providerNodePoolKind = providerNodePool?.kind;

  const nodePoolReleaseVersion =
    nodePool.metadata.labels?.[capiv1beta1.labelReleaseVersion];

  const status: INodesStatus = {
    min: -1,
    max: -1,
    desired: nodePool.status?.replicas ?? -1,
    current: nodePool.status?.readyReplicas ?? -1,
  };

  switch (true) {
    // CAPZ alpha
    case nodePoolReleaseVersion &&
      compare(nodePoolReleaseVersion, Constants.AZURE_CAPZ_VERSION) >= 0: {
      if (providerNodePool) {
        [status.min, status.max] = capzv1beta1.getAzureMachinePoolScaling(
          providerNodePool as capzv1beta1.IAzureMachinePool
        );
      }

      return status;
    }

    // Azure
    case kind === capiv1beta1.MachinePool: {
      [status.min, status.max] = capiv1beta1.getMachinePoolScaling(
        nodePool as capiv1beta1.IMachinePool
      );

      return status;
    }

    // AWS
    case kind === capiv1beta1.MachineDeployment &&
      providerNodePoolKind === infrav1alpha3.AWSMachineDeployment: {
      status.min =
        (providerNodePool as infrav1alpha3.IAWSMachineDeployment)?.spec.nodePool
          .scaling.min ?? -1;
      status.max =
        (providerNodePool as infrav1alpha3.IAWSMachineDeployment)?.spec.nodePool
          .scaling.max ?? -1;

      return status;
    }

    // GCP
    case kind === capiv1beta1.MachineDeployment:
      return status;

    default:
      return status;
  }
}

export function getNodePoolAvailabilityZones(
  nodePool: NodePool,
  providerNodePool: ProviderNodePool
): string[] {
  const kind = nodePool.kind;
  const providerNodePoolKind = providerNodePool?.kind;

  switch (true) {
    // Azure
    case kind === capiv1beta1.MachinePool:
      return (nodePool as capiv1beta1.IMachinePool).spec?.failureDomains ?? [];

    // AWS
    case kind === capiv1beta1.MachineDeployment &&
      providerNodePoolKind === infrav1alpha3.AWSMachineDeployment: {
      return (
        (providerNodePool as infrav1alpha3.IAWSMachineDeployment)?.spec.provider
          .availabilityZones ?? []
      );
    }

    // GCP
    case kind === capiv1beta1.MachineDeployment: {
      const zone = nodePool.spec?.template.spec?.failureDomain;

      return zone ? [zone] : [];
    }

    default:
      return [];
  }
}

export function getClusterReleaseVersion(cluster: Cluster) {
  switch (cluster.apiVersion) {
    case 'cluster.x-k8s.io/v1beta1':
      return capiv1beta1.getReleaseVersion(cluster);
    default:
      return undefined;
  }
}

export function getClusterDescription(
  cluster: Cluster,
  providerCluster: ProviderCluster | null,
  defaultValue: string = Constants.DEFAULT_CLUSTER_DESCRIPTION
): string {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return defaultValue;
  }

  switch (infrastructureRef.kind) {
    case capgv1beta1.GCPCluster:
    case capzv1beta1.AzureCluster:
      return (
        cluster.metadata.annotations?.[
          capiv1beta1.annotationClusterDescription
        ] || defaultValue
      );
    case infrav1alpha3.AWSCluster:
      return (
        (providerCluster as infrav1alpha3.IAWSCluster)?.spec?.cluster
          .description ||
        cluster.metadata.annotations?.[
          capiv1beta1.annotationClusterDescription
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
  switch (providerCluster?.kind) {
    case capgv1beta1.GCPCluster:
      return providerCluster.spec?.region ?? '';

    case capzv1beta1.AzureCluster:
      return providerCluster.spec?.location ?? '';

    case infrav1alpha3.AWSCluster: {
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
  switch (providerCluster?.kind) {
    case capgv1beta1.GCPCluster:
      return providerCluster.spec?.project ?? '';

    case capzv1beta1.AzureCluster: {
      const id = providerCluster.spec?.subscriptionID;
      if (typeof id === 'undefined') return '';

      return id;
    }

    case infrav1alpha3.AWSCluster:
      return '';

    default:
      return undefined;
  }
}

export function getProviderNodePoolLocation(
  providerNodePool: ProviderNodePool
): string {
  switch (providerNodePool?.kind) {
    case capzexpv1alpha3.AzureMachinePool:
    case capzv1beta1.AzureMachinePool:
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
  if (cluster.spec?.infrastructureRef?.kind !== capzv1beta1.AzureCluster) {
    return false;
  }

  const releaseVersion = capiv1beta1.getReleaseVersion(cluster);
  if (!releaseVersion) return false;

  return compare(releaseVersion, Constants.AZURE_CAPZ_VERSION) >= 0;
}

function isCAPGCluster(cluster: Cluster): boolean {
  return cluster.spec?.infrastructureRef?.kind === capgv1beta1.GCPCluster;
}

export function isNodePoolMngmtReadOnly(cluster: Cluster): boolean {
  // TODO: remove isCAPGCluster check once node pool mgmt for GCP is supported
  return isCAPZCluster(cluster) || isCAPGCluster(cluster);
}

export function supportsNodePoolAutoscaling(cluster: Cluster): boolean {
  return !isCAPGCluster(cluster);
}

export function supportsNonExpMachinePools(cluster: Cluster): boolean {
  const releaseVersion = capiv1beta1.getReleaseVersion(cluster);
  if (!releaseVersion) return false;

  return (
    compare(releaseVersion, Constants.AZURE_NON_EXP_MACHINE_POOLS_VERSION) >= 0
  );
}

export function supportsClientCertificates(cluster: Cluster): boolean {
  const infrastructureRef = cluster?.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return false;
  }

  switch (infrastructureRef.kind) {
    case capzv1beta1.AzureCluster:
      return true;

    case infrav1alpha3.AWSCluster: {
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
 * Returns whether the current provider supports the Release CR. These should
 * be the vintage providers.
 * @param provider
 */
export function supportsReleases(
  provider: PropertiesOf<typeof Providers>
): boolean {
  switch (provider) {
    case Providers.AZURE:
    case Providers.AWS:
    case Providers.KVM:
      return true;
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

export function isCAPIProvider(provider: string): boolean {
  switch (provider) {
    case Providers.AZURE:
    case Providers.AWS:
    case Providers.KVM:
      return false;
    default:
      return true;
  }
}

export function getProviderName(
  provider: PropertiesOf<typeof import('model/constants').Providers>
): string {
  switch (provider) {
    case Providers.GCP:
      return 'Google Cloud Platform';
    default:
      return provider;
  }
}
