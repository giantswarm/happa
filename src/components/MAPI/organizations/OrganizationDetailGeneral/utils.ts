import ErrorReporter from 'lib/errors/ErrorReporter';
import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { compare } from 'lib/semver';
import { ControlPlaneNode, NodePool, ProviderNodePool } from 'MAPI/types';
import {
  fetchControlPlaneNodesForCluster,
  fetchNodePoolListForCluster,
  fetchProviderNodePoolsForNodePools,
  getMachineTypes,
  IMachineType,
} from 'MAPI/utils';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import * as ui from 'UI/Display/Organizations/types';

/**
 * Get various statistics about the given clusters.
 * @param httpClientFactory
 * @param auth
 * @param clusters
 */
export async function fetchClustersSummary(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clusters: capiv1alpha3.ICluster[]
): Promise<ui.IOrganizationDetailClustersSummary> {
  const response = await Promise.all(
    clusters.map((cluster) =>
      fetchSingleClusterSummary(httpClientFactory, auth, cluster)
    )
  );

  return mergeClusterSummaries(response);
}

/**
 * The key used for caching the clusters summary.
 * @param clusters
 */
export function fetchClustersSummaryKey(
  clusters?: capiv1alpha3.ICluster[]
): string | null {
  if (!clusters) return null;

  return clusters.map(fetchSingleClusterSummaryKey).join();
}

async function fetchSingleClusterSummary(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1alpha3.ICluster
): Promise<ui.IOrganizationDetailClustersSummary> {
  const summary: ui.IOrganizationDetailClustersSummary = {};

  const machineTypes = getMachineTypes();

  try {
    const cpNodes = await fetchControlPlaneNodesForCluster(
      httpClientFactory,
      auth,
      cluster
    );

    appendControlPlaneNodeStats(cpNodes, machineTypes, summary);
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);
  }

  try {
    const nodePoolList = await fetchNodePoolListForCluster(
      httpClientFactory,
      auth,
      cluster
    );

    appendNodePoolsStats(nodePoolList.items, summary);

    const providerSpecificNodePools = await fetchProviderNodePoolsForNodePools(
      httpClientFactory,
      auth,
      nodePoolList.items
    );

    appendProviderNodePoolsStats(
      nodePoolList.items,
      providerSpecificNodePools,
      machineTypes,
      summary
    );
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);
  }

  return summary;
}

function fetchSingleClusterSummaryKey(cluster: capiv1alpha3.ICluster): string {
  return `fetchSingleClusterSummary/${cluster.metadata.namespace}/${cluster.metadata.name}`;
}

function appendControlPlaneNodeStats(
  controlPlaneNodes: ControlPlaneNode[],
  machineTypes: Record<string, IMachineType>,
  summary: ui.IOrganizationDetailClustersSummary
) {
  summary.nodesCount = 0;

  for (const cpNode of controlPlaneNodes) {
    switch (cpNode.kind) {
      case capzv1alpha3.AzureMachine: {
        summary.nodesCount++;

        const vmSize = cpNode.spec?.vmSize;

        if (typeof vmSize !== 'undefined') {
          const machineTypeProperties = machineTypes[vmSize];
          if (!machineTypeProperties) {
            throw new Error('Invalid machine type.');
          }

          summary.nodesCPU ??= 0;
          summary.nodesCPU += machineTypeProperties.cpu;

          summary.nodesMemory ??= 0;
          summary.nodesMemory += machineTypeProperties.memory;
        }

        break;
      }

      case infrav1alpha3.AWSControlPlane: {
        const instanceType = cpNode.spec.instanceType;

        if (typeof instanceType !== 'undefined') {
          const machineTypeProperties = machineTypes[instanceType];
          if (!machineTypeProperties) {
            throw new Error('Invalid machine type.');
          }

          summary.nodesCPU ??= 0;
          summary.nodesCPU += machineTypeProperties.cpu;

          summary.nodesMemory ??= 0;
          summary.nodesMemory += machineTypeProperties.memory;
        }

        break;
      }

      case infrav1alpha3.G8sControlPlane:
        if (cpNode.spec.replicas) {
          summary.nodesCount += cpNode.spec.replicas;
        }
    }
  }
}

function appendNodePoolsStats(
  nodePools: NodePool[],
  summary: ui.IOrganizationDetailClustersSummary
) {
  for (const nodePool of nodePools) {
    if (typeof nodePool.status?.readyReplicas !== 'undefined') {
      summary.workerNodesCount ??= 0;
      summary.workerNodesCount += nodePool.status.readyReplicas;
    }
  }
}

function appendProviderNodePoolsStats(
  nodePools: NodePool[],
  providerNodePools: ProviderNodePool[],
  machineTypes: Record<string, IMachineType>,
  summary: ui.IOrganizationDetailClustersSummary
) {
  for (let i = 0; i < providerNodePools.length; i++) {
    const providerNp = providerNodePools[i];

    switch (providerNp?.apiVersion) {
      case 'exp.infrastructure.cluster.x-k8s.io/v1alpha3':
      case 'infrastructure.cluster.x-k8s.io/v1alpha4': {
        const vmSize = providerNp.spec?.template.vmSize;
        const readyReplicas = nodePools[i].status?.readyReplicas;

        if (
          typeof vmSize !== 'undefined' &&
          typeof readyReplicas !== 'undefined'
        ) {
          const machineTypeProperties = machineTypes[vmSize];
          if (!machineTypeProperties) {
            throw new Error('Invalid machine type.');
          }

          summary.workerNodesCPU ??= 0;
          summary.workerNodesCPU += machineTypeProperties.cpu * readyReplicas;

          summary.workerNodesMemory ??= 0;
          summary.workerNodesMemory +=
            machineTypeProperties.memory * readyReplicas;
        }

        break;
      }

      case 'infrastructure.giantswarm.io/v1alpha3': {
        const instanceType = providerNp.spec.provider.worker.instanceType;
        const readyReplicas = nodePools[i].status?.readyReplicas;

        if (typeof readyReplicas !== 'undefined') {
          const machineTypeProperties = machineTypes[instanceType];
          if (!machineTypeProperties) {
            throw new Error('Invalid machine type.');
          }

          summary.workerNodesCPU ??= 0;
          summary.workerNodesCPU += machineTypeProperties.cpu * readyReplicas;

          summary.workerNodesMemory ??= 0;
          summary.workerNodesMemory +=
            machineTypeProperties.memory * readyReplicas;
        }

        break;
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
  clusters: capiv1alpha3.ICluster[]
): Promise<ui.IOrganizationDetailReleasesSummary> {
  const summary: ui.IOrganizationDetailReleasesSummary = {};

  let releases: string[] = [];
  for (const cluster of clusters) {
    const version = capiv1alpha3.getReleaseVersion(cluster);
    if (!version) continue;

    releases.push(version);
  }
  releases = releases.sort(compare);

  summary.releasesInUseCount = releases.length;

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
  clusters?: capiv1alpha3.ICluster[]
): string | null {
  if (!clusters) return null;

  const clusterKeys = clusters.map(
    (c) => `${c.metadata.namespace}/${c.metadata.name}`
  );

  return `fetchReleasesSummary/${clusterKeys.join()}`;
}

/**
 * Get various statistics about the apps installed in the given clusters.
 * @param httpClientFactory
 * @param auth
 * @param clusters
 */
export async function fetchAppsSummary(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clusters: capiv1alpha3.ICluster[]
): Promise<ui.IOrganizationDetailAppsSummary> {
  const summary: ui.IOrganizationDetailAppsSummary = {};

  // The key is the app name, and the value is the number of deployments.
  const apps: Record<string, number> = {};

  try {
    // Get all apps that belong to all clusters.
    const appLists = await Promise.all(
      clusters.map((cluster) => {
        return applicationv1alpha1.getAppList(httpClientFactory(), auth, {
          namespace: cluster.metadata.name,
        });
      })
    );

    for (const appList of appLists) {
      for (const app of appList.items) {
        apps[app.spec.name] ??= 0;
        apps[app.spec.name] += 1;
      }
    }
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);
  }

  summary.appsInUseCount = Object.keys(apps).length;
  summary.appDeploymentsCount = Object.values(apps).reduce(
    (acc, curr) => acc + curr,
    0
  );

  return summary;
}

/**
 * The key used for caching the releases summary.
 * @param clusters
 */
export function fetchAppsSummaryKey(
  clusters?: capiv1alpha3.ICluster[]
): string | null {
  if (!clusters) return null;

  const clusterKeys = clusters.map(
    (c) => `${c.metadata.namespace}/${c.metadata.name}`
  );

  return `fetchAppsSummary/${clusterKeys.join()}`;
}
