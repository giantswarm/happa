import { GenericResponse } from 'model/clients/GenericResponse';
import { Constants, ProviderFlavors, Providers } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capav1beta2 from 'model/services/mapi/capav1beta2';
import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capvv1beta1 from 'model/services/mapi/capvv1beta1';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { convertGBtoBytes, convertMBtoBytes, isIPAddress } from 'utils/helpers';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import { compare } from 'utils/semver';

import { hasClusterAppLabel } from './clusters/utils';
import {
  Cluster,
  ClusterList,
  ControlPlane,
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

export function getMachineTypes(): Record<string, IMachineType> | undefined {
  const machineTypes: Record<string, IMachineType> = {};

  if (window.config.awsCapabilitiesJSON) {
    const rawCapabilities: Record<string, IRawAWSInstanceType> = JSON.parse(
      window.config.awsCapabilitiesJSON
    );

    for (const [name, properties] of Object.entries(rawCapabilities)) {
      machineTypes[name] = {
        cpu: properties.cpu_cores,
        memory: convertGBtoBytes(properties.memory_size_gb),
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
        memory: convertMBtoBytes(properties.memoryInMb),
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
        memory: convertMBtoBytes(properties.memoryMb),
      };
    }
  }

  return Object.keys(machineTypes).length > 0 ? machineTypes : undefined;
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

  const apiGroup = getApiGroupFromApiVersion(a.apiVersion);

  if (apiGroup === capiexpv1alpha3.ApiGroup && a.apiVersion === b.apiVersion) {
    // Sort by description.
    const descriptionComparison = capiexpv1alpha3
      .getMachinePoolDescription(a as capiexpv1alpha3.IMachinePool)
      .localeCompare(
        capiexpv1alpha3.getMachinePoolDescription(
          b as capiexpv1alpha3.IMachinePool
        )
      );
    if (descriptionComparison !== 0) {
      return descriptionComparison;
    }
  }

  if (
    a.kind === capiv1beta1.MachinePool &&
    a.kind === b.kind &&
    apiGroup === capiv1beta1.ApiGroup &&
    a.apiVersion === b.apiVersion
  ) {
    // Sort by description.
    const descriptionComparison = capiv1beta1
      .getMachinePoolDescription(a as capiv1beta1.IMachinePool)
      .localeCompare(
        capiv1beta1.getMachinePoolDescription(b as capiv1beta1.IMachinePool)
      );
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

  const { kind, apiVersion } = infrastructureRef;
  const apiGroup = getApiGroupFromApiVersion(apiVersion);

  switch (true) {
    case kind === capgv1beta1.GCPCluster:
    case kind === capvv1beta1.VSphereCluster:
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

    case kind === capzv1beta1.AzureCluster &&
      !supportsNonExpMachinePools(cluster):
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

      break;

    case kind === capzv1beta1.AzureCluster && hasClusterAppLabel(cluster):
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

    case kind === capav1beta2.AWSCluster && apiGroup === capav1beta2.ApiGroup:
    case kind === capav1beta2.AWSManagedCluster &&
      apiGroup === capav1beta2.ApiGroup:
    case kind === capzv1beta1.AzureCluster:
      list = await capiv1beta1.getMachinePoolList(httpClientFactory(), auth, {
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelClusterName]: cluster.metadata.name,
          },
        },
        namespace,
      });

      break;

    case kind === infrav1alpha3.AWSCluster &&
      apiGroup === infrav1alpha3.ApiGroup:
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

  const { kind, apiVersion } = infrastructureRef;
  const apiGroup = getApiGroupFromApiVersion(apiVersion);

  switch (true) {
    case kind === capgv1beta1.GCPCluster:
    case kind === capvv1beta1.VSphereCluster:
      return capiv1beta1.getMachineDeploymentListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelClusterName]: cluster.metadata.name,
            [`${capiv1beta1.labelRole}!`]: 'bastion',
          },
        },
        namespace,
      });

    case kind === capzv1beta1.AzureCluster &&
      !supportsNonExpMachinePools(cluster):
      return capiexpv1alpha3.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelCluster]: cluster.metadata.name,
          },
        },
        namespace,
      });

    case kind === capzv1beta1.AzureCluster && hasClusterAppLabel(cluster):
      return capiv1beta1.getMachineDeploymentListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelClusterName]: cluster.metadata.name,
            [`${capiv1beta1.labelRole}!`]: 'bastion',
          },
        },
        namespace,
      });

    case kind === capav1beta2.AWSCluster && apiGroup === capav1beta2.ApiGroup:
    case kind === capav1beta2.AWSManagedCluster &&
      apiGroup === capav1beta2.ApiGroup:
    case kind === capzv1beta1.AzureCluster:
      return capiv1beta1.getMachinePoolListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelClusterName]: cluster.metadata.name,
          },
        },
        namespace,
      });

    case kind === infrav1alpha3.AWSCluster &&
      apiGroup === infrav1alpha3.ApiGroup:
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

  const apiGroup = getApiGroupFromApiVersion(infrastructureRef.apiVersion);
  const kind = infrastructureRef.kind;

  switch (true) {
    case kind === capav1beta2.AWSMachinePool:
      return capav1beta2.getAWSMachinePool(
        httpClientFactory(),
        auth,
        nodePool.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capav1beta2.AWSManagedMachinePool:
      return capav1beta2.getAWSManagedMachinePool(
        httpClientFactory(),
        auth,
        nodePool.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capgv1beta1.GCPMachineTemplate:
      return capgv1beta1.getGCPMachineTemplate(
        httpClientFactory(),
        auth,
        nodePool.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capvv1beta1.VSphereMachineTemplate:
      return capvv1beta1.getVSphereMachineTemplate(
        httpClientFactory(),
        auth,
        nodePool.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capzv1beta1.AzureMachineTemplate:
      return capzv1beta1.getAzureMachineTemplate(
        httpClientFactory(),
        auth,
        nodePool.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capzexpv1alpha3.AzureMachinePool &&
      apiGroup === capzexpv1alpha3.ApiGroup:
      return capzexpv1alpha3.getAzureMachinePool(
        httpClientFactory(),
        auth,
        nodePool.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capzv1beta1.AzureMachinePool &&
      apiGroup === capzv1beta1.ApiGroup:
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

  const clusterList = await capiv1beta1.getClusterList(
    httpClientFactory(),
    auth,
    getOptions
  );

  clusterList.items = clusterList.items.filter(
    (cluster) => !isManagementCluster(cluster)
  );

  return clusterList;
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

export async function fetchControlPlaneForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1beta1.ICluster
): Promise<ControlPlane | undefined> {
  const controlPlaneRef = cluster.spec?.controlPlaneRef;
  if (!controlPlaneRef) {
    return undefined;
  }

  const { kind, apiVersion } = controlPlaneRef;

  switch (true) {
    case kind === capiv1beta1.KubeadmControlPlane &&
      apiVersion === capiv1beta1.KubeadmControlPlaneApiVersion: {
      return capiv1beta1.getKubeadmControlPlane(
        httpClientFactory(),
        auth,
        controlPlaneRef.namespace ?? '',
        controlPlaneRef.name
      );
    }

    default:
      return undefined;
  }
}

export function fetchControlPlaneForClusterKey(cluster: capiv1beta1.ICluster) {
  const controlPlaneRef = cluster.spec?.controlPlaneRef;
  if (!controlPlaneRef) {
    return null;
  }

  const { kind, apiVersion } = controlPlaneRef;

  switch (true) {
    case kind === capiv1beta1.KubeadmControlPlane &&
      apiVersion === capiv1beta1.KubeadmControlPlaneApiVersion: {
      return capiv1beta1.getKubeadmControlPlaneKey(
        controlPlaneRef.namespace ?? '',
        controlPlaneRef.name
      );
    }

    default:
      return null;
  }
}

// eslint-disable-next-line complexity
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

  const { kind, apiVersion } = infrastructureRef;
  const apiGroup = getApiGroupFromApiVersion(apiVersion);

  switch (true) {
    case kind === capav1beta2.AWSCluster && apiGroup === capav1beta2.ApiGroup: {
      const [capaCP, machineCP] = await Promise.allSettled([
        capav1beta2.getAWSMachineTemplateList(httpClientFactory(), auth, {
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

      if (capaCP.status === 'rejected' && machineCP.status === 'rejected') {
        return Promise.reject(capaCP.reason);
      }

      let cpNodes: ControlPlaneNode[] = [];
      if (capaCP.status === 'fulfilled' && capaCP.value.items.length > 0) {
        cpNodes = [
          ...cpNodes,
          capaCP.value.items.sort(
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

    case kind === capav1beta2.AWSManagedCluster &&
      apiGroup === capav1beta2.ApiGroup: {
      const [capaCP, machineCP] = await Promise.allSettled([
        capav1beta2.getAWSManagedControlPlaneList(httpClientFactory(), auth, {
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelClusterName]: cluster.metadata.name,
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

      if (capaCP.status === 'rejected' && machineCP.status === 'rejected') {
        return Promise.reject(capaCP.reason);
      }

      let cpNodes: ControlPlaneNode[] = [];
      if (capaCP.status === 'fulfilled' && capaCP.value.items.length > 0) {
        cpNodes = [
          ...cpNodes,
          capaCP.value.items.sort(
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

    case kind === capgv1beta1.GCPCluster: {
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

    case kind === capvv1beta1.VSphereCluster &&
      apiGroup === capvv1beta1.ApiGroup: {
      const [capvCP, machineCP] = await Promise.allSettled([
        capvv1beta1.getVSphereMachineList(httpClientFactory(), auth, {
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelClusterName]: cluster.metadata.name,
              [capiv1beta1.labelMachineControlPlane]: '',
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

      if (capvCP.status === 'rejected' && machineCP.status === 'rejected') {
        return Promise.reject(capvCP.reason);
      }

      let cpNodes: ControlPlaneNode[] = [];
      if (capvCP.status === 'fulfilled' && capvCP.value.items.length > 0) {
        cpNodes = [...cpNodes, ...capvCP.value.items];
      }
      if (
        machineCP.status === 'fulfilled' &&
        machineCP.value.items.length > 0
      ) {
        cpNodes = [...cpNodes, ...machineCP.value.items];
      }

      return cpNodes;
    }

    case kind === capzv1beta1.AzureCluster && hasClusterAppLabel(cluster): {
      const [capzCP, machineCP] = await Promise.allSettled([
        capzv1beta1.getAzureMachineTemplateList(httpClientFactory(), auth, {
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

      if (capzCP.status === 'rejected' && machineCP.status === 'rejected') {
        return Promise.reject(capzCP.reason);
      }

      let cpNodes: ControlPlaneNode[] = [];
      if (capzCP.status === 'fulfilled' && capzCP.value.items.length > 0) {
        cpNodes = [
          ...cpNodes,
          capzCP.value.items.sort(
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

    case kind === capzv1beta1.AzureCluster: {
      const cpNodes = await capzv1beta1.getAzureMachineList(
        httpClientFactory(),
        auth,
        {
          labelSelector: {
            matchingLabels: {
              [capiv1beta1.labelCluster]: cluster.metadata.name,
              [capiv1beta1.labelMachineControlPlane]: 'true',
            },
          },
          namespace: cluster.metadata.namespace,
        }
      );

      return cpNodes.items;
    }

    case kind === infrav1alpha3.AWSCluster &&
      apiGroup === infrav1alpha3.ApiGroup: {
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

  const { kind, apiVersion } = infrastructureRef;
  const apiGroup = getApiGroupFromApiVersion(apiVersion);

  switch (true) {
    case kind === capav1beta2.AWSCluster && apiGroup === capav1beta2.ApiGroup:
      return capav1beta2.getAWSMachineTemplateListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelClusterName]: cluster.metadata.name,
            [capiv1beta1.labelRole]: 'control-plane',
          },
        },
        namespace: cluster.metadata.namespace,
      });

    case kind === capav1beta2.AWSManagedCluster &&
      apiGroup === capav1beta2.ApiGroup:
      return capav1beta2.getAWSManagedControlPlaneListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelClusterName]: cluster.metadata.name,
          },
        },
        namespace: cluster.metadata.namespace,
      });

    case kind === capgv1beta1.GCPCluster:
      return capgv1beta1.getGCPMachineTemplateListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelCluster]: cluster.metadata.name,
            [capiv1beta1.labelRole]: 'control-plane',
          },
        },
        namespace: cluster.metadata.namespace,
      });

    case kind === capvv1beta1.VSphereCluster &&
      apiGroup === capvv1beta1.ApiGroup:
      return capvv1beta1.getVSphereMachineTemplateListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelCluster]: cluster.metadata.name,
          },
        },
        namespace: cluster.metadata.namespace,
      });

    case kind === capzv1beta1.AzureCluster && hasClusterAppLabel(cluster):
      return capzv1beta1.getAzureMachineTemplateListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelCluster]: cluster.metadata.name,
            [capiv1beta1.labelRole]: 'control-plane',
          },
        },
        namespace: cluster.metadata.namespace,
      });

    case kind === capzv1beta1.AzureCluster:
      return capzv1beta1.getAzureMachineListKey({
        labelSelector: {
          matchingLabels: {
            [capiv1beta1.labelCluster]: cluster.metadata.name,
          },
        },
        namespace: cluster.metadata.namespace,
      });

    case kind === infrav1alpha3.AWSCluster &&
      apiGroup === infrav1alpha3.ApiGroup:
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

  const { kind, apiVersion } = infrastructureRef;
  const apiGroup = getApiGroupFromApiVersion(apiVersion);

  switch (true) {
    case kind === capav1beta2.AWSCluster && apiGroup === capav1beta2.ApiGroup:
      return capav1beta2.getAWSCluster(
        httpClientFactory(),
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capav1beta2.AWSManagedCluster &&
      apiGroup === capav1beta2.ApiGroup:
      return capav1beta2.getAWSManagedCluster(
        httpClientFactory(),
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capgv1beta1.GCPCluster:
      return capgv1beta1.getGCPCluster(
        httpClientFactory(),
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capvv1beta1.VSphereCluster &&
      apiGroup === capvv1beta1.ApiGroup:
      return capvv1beta1.getVSphereCluster(
        httpClientFactory(),
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capzv1beta1.AzureCluster:
      return capzv1beta1.getAzureCluster(
        httpClientFactory(),
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === infrav1alpha3.AWSCluster &&
      apiGroup === infrav1alpha3.ApiGroup:
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

  const { kind, apiVersion } = infrastructureRef;
  const apiGroup = getApiGroupFromApiVersion(apiVersion);

  switch (true) {
    case kind === capav1beta2.AWSCluster && apiGroup === capav1beta2.ApiGroup:
      return capav1beta2.getAWSClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capav1beta2.AWSManagedCluster &&
      apiGroup === capav1beta2.ApiGroup:
      return capav1beta2.getAWSManagedClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capgv1beta1.GCPCluster:
      return capgv1beta1.getGCPClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capvv1beta1.VSphereCluster &&
      apiGroup === capvv1beta1.ApiGroup:
      return capvv1beta1.getVSphereClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === capzv1beta1.AzureCluster:
      return capzv1beta1.getAzureClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    case kind === infrav1alpha3.AWSCluster &&
      apiGroup === infrav1alpha3.ApiGroup:
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
    case capav1beta2.AWSMachinePool:
      return {
        primary: providerNodePool.spec?.awsLaunchTemplate.instanceType ?? '',
      };

    // EKS
    case capav1beta2.AWSManagedMachinePool:
      return {
        primary:
          providerNodePool.spec?.instanceType ||
          providerNodePool.spec?.awsLaunchTemplate?.instanceType ||
          '',
      };

    case capgv1beta1.GCPMachineTemplate:
      return {
        primary: providerNodePool.spec?.template.spec.instanceType ?? '',
      };
    case capzv1beta1.AzureMachinePool:
      return { primary: providerNodePool.spec?.template.vmSize ?? '' };
    case capzv1beta1.AzureMachineTemplate:
      return { primary: providerNodePool?.spec?.template.spec.vmSize ?? '' };
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

export interface INodePoolSpotInstancesCAPA {
  enabled: boolean;
  maxPrice: string;
  onDemandBaseCapacity: number;
  onDemandPercentageAboveBaseCapacity: number;
}

export type NodePoolSpotInstances =
  | INodePoolSpotInstancesAzure
  | INodePoolSpotInstancesAWS
  | INodePoolSpotInstancesCAPA;

export function getProviderNodePoolSpotInstances(
  providerNodePool: ProviderNodePool
): NodePoolSpotInstances | undefined {
  switch (providerNodePool?.kind) {
    case capav1beta2.AWSMachinePool: {
      const onDemandBaseCapacity =
        providerNodePool.spec?.mixedInstancesPolicy?.instancesDistribution
          ?.onDemandBaseCapacity ?? 0;
      const onDemandPercentageAboveBaseCapacity =
        providerNodePool.spec?.mixedInstancesPolicy?.instancesDistribution
          ?.onDemandPercentageAboveBaseCapacity ?? 0;
      const maxPrice =
        providerNodePool.spec?.awsLaunchTemplate.spotMarketOptions?.maxPrice ??
        '';

      return {
        enabled:
          typeof providerNodePool.spec?.awsLaunchTemplate.spotMarketOptions !==
            // eslint-disable-next-line no-magic-numbers
            'undefined' && onDemandPercentageAboveBaseCapacity < 100,
        maxPrice,
        onDemandBaseCapacity: onDemandBaseCapacity,
        onDemandPercentageAboveBaseCapacity:
          onDemandPercentageAboveBaseCapacity,
      };
    }

    case capzexpv1alpha3.AzureMachinePool:
    case capzv1beta1.AzureMachinePool: {
      try {
        const maxPriceQty =
          providerNodePool.spec?.template.spotVMOptions?.maxPrice;
        const maxPrice = maxPriceQty
          ? metav1.quantityToScalar(maxPriceQty.toString())
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

    case capzv1beta1.AzureMachineTemplate: {
      const maxPriceQty =
        providerNodePool.spec?.template.spec.spotVMOptions?.maxPrice;
      const maxPrice = maxPriceQty
        ? metav1.quantityToScalar(maxPriceQty.toString())
        : -1;

      return {
        enabled:
          typeof providerNodePool.spec?.template.spec.spotVMOptions !==
          'undefined',
        maxPrice: maxPrice as number,
      };
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

export function getNodePoolReadyReplicas(nodePool: NodePool) {
  const infrastructureRef = nodePool.spec?.template.spec?.infrastructureRef;
  if (
    infrastructureRef &&
    infrastructureRef.kind === capav1beta2.AWSManagedMachinePool
  ) {
    return nodePool.spec?.replicas ?? 0;
  }

  return nodePool.status?.readyReplicas ?? 0;
}

export function getNodePoolScaling(
  nodePool: NodePool,
  providerNodePool: ProviderNodePool | null
): INodesStatus {
  const kind = nodePool.kind;
  const providerNodePoolKind = providerNodePool?.kind;

  const status: INodesStatus = {
    min: -1,
    max: -1,
    desired: nodePool.status?.replicas ?? -1,
    current: nodePool.status?.readyReplicas ?? -1,
  };

  switch (true) {
    // CAPA
    case kind === capiv1beta1.MachinePool &&
      providerNodePoolKind === capav1beta2.AWSMachinePool: {
      status.min =
        (providerNodePool as capav1beta2.IAWSMachinePool).spec?.minSize ?? -1;
      status.max =
        (providerNodePool as capav1beta2.IAWSMachinePool).spec?.maxSize ?? -1;

      return status;
    }

    // EKS Imported
    case kind === capiv1beta1.MachinePool &&
      providerNodePoolKind === capav1beta2.AWSManagedMachinePool: {
      status.min =
        (providerNodePool as capav1beta2.IAWSManagedMachinePool).spec?.scaling
          ?.minSize ?? -1;
      status.max =
        (providerNodePool as capav1beta2.IAWSManagedMachinePool).spec?.scaling
          ?.maxSize ?? -1;
      status.desired = nodePool.spec?.replicas ?? -1;
      status.current = nodePool.spec?.replicas ?? -1;

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

    // CAPZ, GCP
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
    // CAPA
    case kind === capiv1beta1.MachinePool &&
      providerNodePoolKind === capav1beta2.AWSMachinePool:
      return (
        (providerNodePool as capav1beta2.IAWSMachinePool).spec
          ?.availabilityZones ?? []
      );

    // EKS Imported
    case kind === capiv1beta1.MachinePool &&
      providerNodePoolKind === capav1beta2.AWSManagedMachinePool:
      return (
        (providerNodePool as capav1beta2.IAWSManagedMachinePool).spec
          ?.availabilityZones ?? []
      );

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

    // CAPZ, GCP
    case kind === capiv1beta1.MachineDeployment: {
      const zone = nodePool.spec?.template.spec?.failureDomain;

      return zone ? [zone] : [];
    }

    default:
      return [];
  }
}

export function getClusterReleaseVersion(cluster: Cluster) {
  switch (getApiGroupFromApiVersion(cluster.apiVersion)) {
    case capiv1beta1.ApiGroup:
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

  const { kind, apiVersion } = infrastructureRef;
  const apiGroup = getApiGroupFromApiVersion(apiVersion);

  if (isResourceImported(cluster)) {
    switch (true) {
      case kind === capav1beta2.AWSManagedCluster:
        return 'Imported EKS cluster';
      default:
        return 'Imported cluster';
    }
  }

  switch (true) {
    case kind === infrav1alpha3.AWSCluster &&
      apiGroup === infrav1alpha3.ApiGroup:
      return (
        (providerCluster as infrav1alpha3.IAWSCluster)?.spec?.cluster
          .description ||
        cluster.metadata.annotations?.[
          capiv1beta1.annotationClusterDescription
        ] ||
        defaultValue
      );
    default:
      return (
        cluster.metadata.annotations?.[
          capiv1beta1.annotationClusterDescription
        ] || defaultValue
      );
  }
}

export function getProviderClusterLocation(
  providerCluster: ProviderCluster
): string | undefined {
  if (typeof providerCluster === 'undefined') {
    return undefined;
  }

  const { kind, apiVersion } = providerCluster;
  const apiGroup = getApiGroupFromApiVersion(apiVersion);

  switch (true) {
    case kind === capav1beta2.AWSCluster && apiGroup === capav1beta2.ApiGroup:
      return (providerCluster as capav1beta2.IAWSCluster).spec?.region ?? '';

    case kind === capgv1beta1.GCPCluster:
      return providerCluster.spec?.region ?? '';

    case kind === capzv1beta1.AzureCluster:
      return providerCluster.spec?.location ?? '';

    case kind === infrav1alpha3.AWSCluster &&
      apiGroup === infrav1alpha3.ApiGroup: {
      const region = (providerCluster as infrav1alpha3.IAWSCluster).spec
        ?.provider.region;
      if (typeof region === 'undefined') return '';

      return region;
    }

    default:
      return undefined;
  }
}

export function getControlPlaneNodeLocation(
  controlPlaneNode?: ControlPlaneNode
): string | undefined {
  if (typeof controlPlaneNode === 'undefined') {
    return undefined;
  }

  const { kind } = controlPlaneNode;

  switch (true) {
    case kind === capav1beta2.AWSManagedControlPlane:
      return controlPlaneNode.spec?.region ?? '';

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

const uidRegexp = /^[a-z]([a-z][0-9]|[0-9][a-z])+[a-z0-9]?$/;
const supportedUIDChars = '023456789abcdefghijkmnopqrstuvwxyz';

/**
 * Generate unique resource names, that can be used for node pool or cluster names.
 * @param length
 */
export function generateUID(length: number): string {
  if (length < 3) {
    throw new Error('Length is too short');
  }

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

export function getClusterK8sAPIUrl(
  cluster: capiv1beta1.ICluster,
  providerFlavor: ProviderFlavors
) {
  let hostname = cluster.spec?.controlPlaneEndpoint?.host;
  if (!hostname) return '';

  const port = cluster.spec?.controlPlaneEndpoint?.port;

  // If the control plane host is an IP address then it is a CAPI cluster
  if (isIPAddress(hostname)) {
    hostname = getClusterBaseUrl(cluster, providerFlavor).host;
  }

  const url = `${hostname}${port ? `:${port}` : ''}`;

  return url.startsWith('https://') ? url : `https://${url}`;
}

export function getK8sAPIUrl(providerFlavor: ProviderFlavors): string {
  return getInstallationBaseURL(providerFlavor).toString();
}

export function getClusterBaseUrl(
  cluster: capiv1beta1.ICluster,
  providerFlavor: ProviderFlavors
) {
  const installationBaseURL = getInstallationBaseURL(providerFlavor);

  const clusterBaseUrl = new URL(installationBaseURL);
  clusterBaseUrl.host = clusterBaseUrl.host.replace(
    window.config.info.general.installationName,
    cluster.metadata.name
  );

  return clusterBaseUrl;
}

function getInstallationBaseURL(providerFlavor: ProviderFlavors): URL {
  const audienceURL = new URL(`https://${window.config.mapiAudience}`);
  // Remove all characters until the first `.`.
  audienceURL.host = audienceURL.host.substring(
    audienceURL.host.indexOf('.') + 1
  );

  if (providerFlavor === ProviderFlavors.CAPI) {
    audienceURL.host = `api.${audienceURL.host}`;
  }

  return audienceURL;
}

function isCAPGCluster(cluster: Cluster): boolean {
  return cluster.spec?.infrastructureRef?.kind === capgv1beta1.GCPCluster;
}

function isCAPZCluster(cluster: Cluster): boolean {
  return cluster.spec?.infrastructureRef?.kind === capzv1beta1.AzureCluster;
}

function isVSphereCluster(cluster: Cluster): boolean {
  return cluster.spec?.infrastructureRef?.kind === capvv1beta1.VSphereCluster;
}

export function isNodePoolMngmtReadOnly(cluster: Cluster): boolean {
  return hasClusterAppLabel(cluster) || isResourceImported(cluster);
}

export function supportsNodePoolAutoscaling(cluster: Cluster): boolean {
  return !(
    isCAPGCluster(cluster) ||
    isCAPZCluster(cluster) ||
    isVSphereCluster(cluster)
  );
}

export function supportsMachineTypes(cluster: Cluster): boolean {
  return !isVSphereCluster(cluster);
}

export function supportsAvailabilityZones(cluster: Cluster): boolean {
  return !isVSphereCluster(cluster);
}

export function supportsNonExpMachinePools(cluster: Cluster): boolean {
  const releaseVersion = capiv1beta1.getReleaseVersion(cluster);
  if (!releaseVersion) return true;

  return (
    compare(releaseVersion, Constants.AZURE_NON_EXP_MACHINE_POOLS_VERSION) >= 0
  );
}

export function supportsClientCertificates(cluster: Cluster): boolean {
  const infrastructureRef = cluster?.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return false;
  }

  const { kind, apiVersion } = infrastructureRef;
  const apiGroup = getApiGroupFromApiVersion(apiVersion);

  switch (true) {
    case kind === capzv1beta1.AzureCluster:
      return true;

    case kind === infrav1alpha3.AWSCluster &&
      apiGroup === infrav1alpha3.ApiGroup: {
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
      return true;
  }
}

/**
 * Returns whether the current provider supports the Release CR. These should
 * be the vintage providers.
 * @param provider
 */
export function supportsReleases(providerFlavor: ProviderFlavors): boolean {
  return providerFlavor === ProviderFlavors.VINTAGE;
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

export function getApiGroupFromApiVersion(apiVersion: string): string {
  return apiVersion.split('/')[0];
}

/**
 * Returns whether or not a cluster is a management cluster, by
 * the criteria that the cluster:
 * - is in the `org-giantswarm` namespace
 * - has a name equal to the installation name
 * - is a cluster app (has the `app: cluster-...` label)
 * @param cluster
 */
export function isManagementCluster(cluster: Cluster): boolean {
  return (
    cluster.metadata.namespace === Constants.MANAGEMENT_CLUSTER_NAMESPACE &&
    cluster.metadata.name === window.config.info.general.installationName &&
    hasClusterAppLabel(cluster)
  );
}

/**
 * Determines whether a resource is managed by GitOps.
 * @param resource
 */
export function isResourceManagedByGitOps(
  resource:
    | capiv1beta1.ICluster
    | securityv1alpha1.IOrganization
    | applicationv1alpha1.IApp
    | NodePool
) {
  const labels = Object.keys(resource.metadata.labels ?? {});

  return labels.some((label) =>
    label.startsWith(Constants.FLUX_LABELS_PREFIX as string)
  );
}

function getResourceAppName(resource: Cluster | NodePool): string | undefined {
  return resource.metadata.labels?.[capiv1beta1.labelApp];
}

/**
 * Determines whether a resource is imported.
 * @param resource
 */
export function isResourceImported(resource: Cluster | NodePool) {
  return getResourceAppName(resource) === capiv1beta1.CAPI_IMPORTER_APP_NAME;
}
