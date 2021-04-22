import ErrorReporter from 'lib/errors/ErrorReporter';
import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
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

async function fetchSingleClusterSummary(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1alpha3.ICluster
): Promise<ui.IOrganizationDetailClustersSummary> {
  const summary: ui.IOrganizationDetailClustersSummary = {
    nodesCount: capiv1alpha3.getNodeCount(cluster),
  };

  try {
    const [machineTypes, nodePoolList] = await Promise.all([
      fetchMachineTypes(httpClientFactory, auth),
      fetchNodePoolListForCluster(httpClientFactory, auth, cluster),
    ]);

    for (const nodePool of nodePoolList.items) {
      if (typeof nodePool.status?.readyReplicas !== 'undefined') {
        summary.workerNodesCount ??= 0;
        summary.workerNodesCount += nodePool.status.readyReplicas;
      }
    }

    const providerSpecificNodePools = await fetchProviderNodePoolsForNodePools(
      httpClientFactory,
      auth,
      nodePoolList.items
    );

    for (let i = 0; i < providerSpecificNodePools.length; i++) {
      const vmSize = providerSpecificNodePools[i].spec?.template.vmSize;
      const readyReplicas = nodePoolList.items[i].status?.readyReplicas;

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
    }
  } catch (err) {
    ErrorReporter.getInstance().notify(err);
  }

  return summary;
}

function fetchSingleClusterSummaryKey(cluster: capiv1alpha3.ICluster): string {
  return `fetchSingleClusterSummary/${cluster.metadata.namespace}/${cluster.metadata.name}`;
}

interface IMachineType {
  cpu: number;
  memory: number;
}

async function fetchMachineTypes(
  _httpClientFactory: HttpClientFactory,
  _auth: IOAuth2Provider
): Promise<Record<string, IMachineType>> {
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

  return Promise.resolve(machineTypes);
}

async function fetchNodePoolListForCluster(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cluster: capiv1alpha3.ICluster
) {
  const { infrastructureRef } = cluster.spec;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capiexpv1alpha3.getMachinePoolList(httpClientFactory(), auth);

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      return capiv1alpha3.getMachineDeploymentList(httpClientFactory(), auth);

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

async function fetchProviderNodePoolsForNodePools(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  nodePools: capiv1alpha3.IMachineDeployment[] | capiexpv1alpha3.IMachinePool[]
) {
  return Promise.all(
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
}
