import {
  fetchControlPlaneNodesK8sVersions,
  formatK8sVersion,
  getClusterAppVersion,
  hasClusterAppLabel,
  IProviderClusterForCluster,
} from 'MAPI/clusters/utils';
import { IPermissions } from 'MAPI/permissions/types';
import { ControlPlaneNode, NodePool } from 'MAPI/types';
import {
  fetchControlPlaneNodesForCluster,
  fetchNodePoolListForCluster,
  fetchProviderNodePoolsForNodePools,
  getMachineTypes,
  getNodePoolReadyReplicas,
  getProviderNodePoolMachineTypes,
  IMachineType,
} from 'MAPI/utils';
import {
  IProviderNodePoolForNodePool,
  mapNodePoolsToProviderNodePools,
} from 'MAPI/workernodes/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import * as capav1beta2 from 'model/services/mapi/capav1beta2';
import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capvv1beta1 from 'model/services/mapi/capvv1beta1';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import * as ui from 'UI/Display/Organizations/types';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { convertMiBtoBytes } from 'utils/helpers';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import { compare } from 'utils/semver';

/**
 * Get various statistics about the given clusters.
 * @param httpClientFactory
 * @param auth
 * @param clusters
 * @param CPNodesPermissions
 * @param nodePoolsPermissions
 */
export async function fetchClustersSummary(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clusters: capiv1beta1.ICluster[],
  CPNodesPermissions: IPermissions,
  nodePoolsPermissions: IPermissions
): Promise<ui.IOrganizationDetailClustersSummary> {
  const response = await Promise.all(
    clusters.map((cluster) =>
      fetchSingleClusterSummary(
        httpClientFactory,
        auth,
        cluster,
        CPNodesPermissions,
        nodePoolsPermissions
      )
    )
  );

  return mergeClusterSummaries(response);
}

/**
 * The key used for caching the clusters summary.
 * @param clusters
 */
export function fetchClustersSummaryKey(
  clusters?: capiv1beta1.ICluster[]
): string | null {
  if (!clusters) return null;

  return clusters.map(fetchSingleClusterSummaryKey).join();
}

async function fetchSingleClusterSummary(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1beta1.ICluster,
  CPNodesPermissions: IPermissions,
  nodePoolsPermissions: IPermissions
): Promise<ui.IOrganizationDetailClustersSummary> {
  const summary: ui.IOrganizationDetailClustersSummary = {};

  const machineTypes = getMachineTypes();

  if (CPNodesPermissions.canList) {
    try {
      const cpNodes = await fetchControlPlaneNodesForCluster(
        httpClientFactory,
        auth,
        cluster
      );

      appendControlPlaneNodeStats(summary, cpNodes, machineTypes);
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  if (nodePoolsPermissions.canList && nodePoolsPermissions.canGet) {
    try {
      const nodePoolList = await fetchNodePoolListForCluster(
        httpClientFactory,
        auth,
        cluster,
        cluster.metadata.namespace
      );

      appendNodePoolsStats(summary, nodePoolList.items);

      const providerSpecificNodePools =
        await fetchProviderNodePoolsForNodePools(
          httpClientFactory,
          auth,
          nodePoolList.items
        );

      const nodePoolsWithProviderNodePools = mapNodePoolsToProviderNodePools(
        nodePoolList.items,
        providerSpecificNodePools
      );

      appendProviderNodePoolsStats(
        summary,
        nodePoolsWithProviderNodePools,
        machineTypes
      );
    } catch (err) {
      ErrorReporter.getInstance().notify(err as Error);
    }
  }

  return summary;
}

function fetchSingleClusterSummaryKey(cluster: capiv1beta1.ICluster): string {
  return `fetchSingleClusterSummary/${cluster.metadata.namespace}/${cluster.metadata.name}`;
}

// eslint-disable-next-line complexity
function appendControlPlaneNodeStats(
  summary: ui.IOrganizationDetailClustersSummary,
  controlPlaneNodes: ControlPlaneNode[],
  machineTypes?: Record<string, IMachineType>
) {
  summary.nodesCount = 0;

  const instanceTypes: string[] = [];

  for (const cpNode of controlPlaneNodes) {
    switch (cpNode.kind) {
      case capav1beta2.AWSMachineTemplate:
      case capgv1beta1.GCPMachineTemplate:
        if (cpNode.spec?.template?.spec.instanceType) {
          instanceTypes.push(cpNode.spec.template.spec.instanceType);
        }

        break;

      case capiv1beta1.Machine:
        summary.nodesCount++;

        break;

      case capzv1beta1.AzureMachine: {
        summary.nodesCount++;

        if (cpNode.spec?.vmSize) {
          instanceTypes.push(cpNode.spec.vmSize);
        }

        break;
      }

      case capzv1beta1.AzureMachineTemplate: {
        if (cpNode.spec?.template?.spec.vmSize) {
          instanceTypes.push(cpNode.spec.template.spec.vmSize);
        }

        break;
      }

      case infrav1alpha3.AWSControlPlane: {
        if (cpNode.spec.instanceType) {
          instanceTypes.push(cpNode.spec.instanceType);
        }

        break;
      }

      case infrav1alpha3.G8sControlPlane:
        if (cpNode.spec.replicas) {
          summary.nodesCount += cpNode.spec.replicas;
        }
    }
  }
  if (machineTypes) {
    for (let i = 0; i < summary.nodesCount; i++) {
      const instanceType = instanceTypes[i] ?? instanceTypes[0];

      const machineTypeProperties = machineTypes[instanceType];
      if (!machineTypeProperties) {
        throw new Error('Invalid machine type.');
      }

      summary.nodesCPU ??= 0;
      summary.nodesCPU += machineTypeProperties.cpu;

      summary.nodesMemory ??= 0;
      summary.nodesMemory += machineTypeProperties.memory;
    }
  } else {
    for (const cpNode of controlPlaneNodes) {
      if (cpNode.kind === capvv1beta1.VSphereMachine) {
        const numCPUs = cpNode.spec?.numCPUs;
        if (numCPUs) {
          summary.nodesCPU ??= 0;
          summary.nodesCPU += numCPUs;
        }

        const memoryMiB = cpNode.spec?.memoryMiB;
        if (memoryMiB) {
          summary.nodesMemory ??= 0;
          summary.nodesMemory += convertMiBtoBytes(memoryMiB);
        }
      }
    }
  }
}

function appendNodePoolsStats(
  summary: ui.IOrganizationDetailClustersSummary,
  nodePools: NodePool[]
) {
  for (const nodePool of nodePools) {
    summary.workerNodesCount ??= 0;
    summary.workerNodesCount += getNodePoolReadyReplicas(nodePool);
  }
}

function appendProviderNodePoolsStats(
  summary: ui.IOrganizationDetailClustersSummary,
  nodePoolsWithProviderNodePools: IProviderNodePoolForNodePool[],
  machineTypes?: Record<string, IMachineType>
) {
  for (const { nodePool, providerNodePool } of nodePoolsWithProviderNodePools) {
    const readyReplicas = getNodePoolReadyReplicas(nodePool);
    if (!readyReplicas || !providerNodePool) continue;

    if (machineTypes) {
      const instanceType =
        getProviderNodePoolMachineTypes(providerNodePool)?.primary;

      const machineTypeProperties = instanceType
        ? machineTypes[instanceType]
        : null;
      if (!machineTypeProperties) {
        throw new Error('Invalid machine type.');
      }

      summary.workerNodesCPU ??= 0;
      summary.workerNodesCPU += machineTypeProperties.cpu * readyReplicas;

      summary.workerNodesMemory ??= 0;
      summary.workerNodesMemory += machineTypeProperties.memory * readyReplicas;
    } else if (providerNodePool.kind === capvv1beta1.VSphereMachineTemplate) {
      const numCPUs = providerNodePool.spec?.template?.spec?.numCPUs;
      if (numCPUs) {
        summary.workerNodesCPU ??= 0;
        summary.workerNodesCPU += numCPUs * readyReplicas;
      }

      const memoryMiB = providerNodePool.spec?.template?.spec?.memoryMiB;
      if (memoryMiB) {
        summary.workerNodesMemory ??= 0;
        summary.workerNodesMemory +=
          convertMiBtoBytes(memoryMiB) * readyReplicas;
      }
    }
  }
}

function mergeClusterSummaries(
  summaries: ui.IOrganizationDetailClustersSummary[]
) {
  return summaries.reduce(
    (
      acc: ui.IOrganizationDetailClustersSummary,
      currItem: ui.IOrganizationDetailClustersSummary
    ) => {
      if (currItem.nodesCount) {
        acc.nodesCount ??= 0;
        acc.nodesCount += currItem.nodesCount;
      }

      if (currItem.nodesCPU) {
        acc.nodesCPU ??= 0;
        acc.nodesCPU += currItem.nodesCPU;
      }

      if (currItem.nodesMemory) {
        acc.nodesMemory ??= 0;
        acc.nodesMemory += currItem.nodesMemory;
      }

      if (currItem.workerNodesCount) {
        acc.workerNodesCount ??= 0;
        acc.workerNodesCount += currItem.workerNodesCount;
      }

      if (currItem.workerNodesCPU) {
        acc.workerNodesCPU ??= 0;
        acc.workerNodesCPU += currItem.workerNodesCPU;
      }

      if (currItem.workerNodesMemory) {
        acc.workerNodesMemory ??= 0;
        acc.workerNodesMemory += currItem.workerNodesMemory;
      }

      return acc;
    },
    {}
  );
}

/**
 * Get various statistics about the release versions of the given clusters.
 * @param httpClientFactory
 * @param auth
 * @param clusters
 */
export async function fetchReleasesSummary(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clusters: capiv1beta1.ICluster[]
): Promise<ui.IOrganizationDetailReleasesSummary> {
  const summary: ui.IOrganizationDetailReleasesSummary = {};

  let releases: string[] = [];
  for (const cluster of clusters) {
    const version = capiv1beta1.getReleaseVersion(cluster);
    if (!version) continue;

    releases.push(version);
  }
  releases = releases.sort(compare);

  summary.releasesInUseCount = new Set(releases).size;

  if (summary.releasesInUseCount < 1) return Promise.resolve(summary);

  summary.oldestReleaseVersion = releases[0];
  summary.newestReleaseVersion = releases[releases.length - 1];

  try {
    const [oldestReleasePromise, newestReleasePromise] =
      await Promise.allSettled([
        releasev1alpha1.getRelease(
          httpClientFactory(),
          auth,
          `v${summary.oldestReleaseVersion}`
        ),
        releasev1alpha1.getRelease(
          httpClientFactory(),
          auth,
          `v${summary.newestReleaseVersion}`
        ),
      ]);

    if (oldestReleasePromise.status === 'rejected') {
      throw oldestReleasePromise.reason;
    }
    summary.oldestReleaseK8sVersion = releasev1alpha1.getK8sVersion(
      oldestReleasePromise.value
    );

    if (newestReleasePromise.status === 'rejected') {
      throw newestReleasePromise.reason;
    }
    summary.newestReleaseK8sVersion = releasev1alpha1.getK8sVersion(
      newestReleasePromise.value
    );
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);
  }

  return summary;
}

/**
 * The key used for caching the releases summary.
 * @param clusters
 */
export function fetchReleasesSummaryKey(
  clusters?: capiv1beta1.ICluster[]
): string | null {
  if (!clusters) return null;

  const clusterKeys = clusters.map(
    (c) => `${c.metadata.namespace}/${c.metadata.name}`
  );

  return `fetchReleasesSummary/${clusterKeys.join()}`;
}

/**
 * Get statistics about the cluster app and Kubernetes versions of the given clusters.
 * @param httpClientFactory
 * @param auth
 * @param clusters
 */
export async function fetchVersionsSummary(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clustersWithProviderClusters: IProviderClusterForCluster[]
): Promise<ui.IOrganizationDetailVersionsSummary> {
  const summary: ui.IOrganizationDetailVersionsSummary = {};

  // cluster app versions
  let clusterAppVersions: string[] = [];
  for (const { cluster, providerCluster } of clustersWithProviderClusters) {
    if (!hasClusterAppLabel(cluster) || providerCluster === null) continue;
    const version = getClusterAppVersion(providerCluster);
    if (!version) continue;

    clusterAppVersions.push(version);
  }
  clusterAppVersions = clusterAppVersions.sort(compare);

  summary.clusterAppVersionsInUseCount = new Set(clusterAppVersions).size;

  summary.oldestClusterAppVersion = clusterAppVersions[0];
  summary.newestClusterAppVersion =
    clusterAppVersions[clusterAppVersions.length - 1];

  // Get all Kubernetes versions of the clusters
  let k8sVersions: string[] = [];
  const responses = await Promise.allSettled(
    clustersWithProviderClusters.map(({ cluster }) => {
      return fetchControlPlaneNodesK8sVersions(
        httpClientFactory,
        auth,
        cluster
      );
    })
  );

  for (const response of responses) {
    if (
      response.status === 'rejected' &&
      !metav1.isStatusError(
        (response.reason as GenericResponse).data,
        metav1.K8sStatusErrorReasons.Forbidden
      )
    ) {
      ErrorReporter.getInstance().notify(response.reason as Error);
    }

    if (response.status === 'fulfilled' && response.value.length > 0) {
      for (const version of response.value) {
        k8sVersions.push(formatK8sVersion(version));
      }
    }
  }

  k8sVersions = k8sVersions.sort(compare);

  summary.k8sVersionsInUseCount = new Set(k8sVersions).size;

  summary.oldestK8sVersion = k8sVersions[0];
  summary.newestK8sVersion = k8sVersions[k8sVersions.length - 1];

  return summary;
}

/**
 * The key used for caching the versions summary.
 * @param clusters
 */
export function fetchVersionsSummaryKey(
  clusters?: capiv1beta1.ICluster[]
): string | null {
  if (!clusters) return null;

  const clusterKeys = clusters.map(
    (c) => `${c.metadata.namespace}/${c.metadata.name}`
  );

  return `fetchVersionsSummary/${clusterKeys.join()}`;
}
