import { IState } from 'reducers/types';
import { getMinHAMastersVersion } from 'selectors/featureSelectors';
import cmp from 'semver-compare';
import { Constants, Providers } from 'shared/constants';
import { INodePool, PropertiesOf } from 'shared/types';
import { validateLabelKey } from 'utils/labelUtils';

/**
 * Determine whether a cluster at a certain version can be upgraded to a target version.
 * @param currentVersion
 * @param targetVersion
 * @param provider
 */
export function canClusterUpgrade(
  currentVersion: string | undefined,
  targetVersion: string | undefined,
  provider: PropertiesOf<typeof Providers>
): boolean {
  // Cluster must have a release_version.
  if (!currentVersion) return false;

  // A target release to upgrade to must be defined.
  if (!targetVersion) return false;

  // We must not be trying to go from v4 to v5 on AWS.
  const targetingV5 = cmp(targetVersion, Constants.AWS_V5_VERSION) >= 0;
  const currentlyV4 = cmp(currentVersion, Constants.AWS_V5_VERSION) < 0;
  const onAWS = provider === Providers.AWS;

  if (onAWS && targetingV5 && currentlyV4) return false;

  return true;
}

/**
 * Get the number of worker nodes in a cluster.
 * @param cluster
 */
export function getNumberOfNodes(cluster: V4.ICluster): number {
  if (
    !cluster.status ||
    !cluster.status.cluster.nodes ||
    cluster.status.cluster.nodes.length < 1
  ) {
    return 0;
  }

  const nodes = cluster.status.cluster.nodes;

  const workerNodes = nodes.reduce((accumulator, node) => {
    let newAccumulator = accumulator;

    if (
      node.labels?.role !== 'master' &&
      node.labels?.['kubernetes.io/role'] !== 'master'
    ) {
      newAccumulator++;
    }

    return newAccumulator;
  }, 0);

  return workerNodes;
}

/**
 * Get the total memory of all the worker nodes in a cluster.
 * @param cluster
 */
export function getMemoryTotal(cluster: V4.ICluster): number {
  const numOfWorkers = getNumberOfNodes(cluster);
  if (!numOfWorkers || !cluster.workers || cluster.workers.length === 0) {
    return 0;
  }

  // eslint-disable-next-line no-magic-numbers
  const memory =
    Math.ceil(numOfWorkers * cluster.workers[0].memory.size_gb * 100) / 100;

  return memory;
}

/**
 * Get the total storage available in all the worker nodes of a cluster.
 * @param cluster
 */
export function getStorageTotal(cluster: V4.ICluster): number {
  const numOfWorkers = getNumberOfNodes(cluster);
  if (!numOfWorkers || !cluster.workers || cluster.workers.length === 0) {
    return 0;
  }

  const storage =
    // eslint-disable-next-line no-magic-numbers
    Math.ceil(numOfWorkers * cluster.workers[0].storage.size_gb * 100) / 100;

  return storage;
}

/**
 * Get total number of CPUs in all the worker nodes of a cluster.
 * @param cluster
 */
export function getCpusTotal(cluster: V4.ICluster): number {
  const numOfWorkers = getNumberOfNodes(cluster);
  if (!numOfWorkers || !cluster.workers || cluster.workers.length === 0) {
    return 0;
  }

  return numOfWorkers * cluster.workers[0].cpu.cores;
}

/**
 * Get the total number of nodes in all node pools.
 * @param nodePools
 */
export function getNumberOfNodePoolsNodes(nodePools: INodePool[]) {
  if (nodePools.length === 0) return 0;

  return nodePools.reduce((accumulator, current) => {
    return accumulator + current.status.nodes;
  }, 0);
}

/**
 * Get total memory in all node pools.
 * @param nodePools
 */
export function getMemoryTotalNodePools(nodePools: INodePool[]): number {
  const provider = guessProviderFromNodePools(nodePools);
  if (provider === null) {
    return 0;
  }

  const instanceTypes = getInstanceTypesForProvider(provider);
  if (instanceTypes === null) {
    return 0;
  }

  /**
   * Here we are returning (and accumulating) for each node pool the number
   * of RAM each instance has multiplied by the number of nodes the node pool has.
   *
   * TODO: When working with Spot Instances a node pool could have different types
   * of instances, and this method will have to be modified.
   */
  const totalRAM = nodePools.reduce((accumulator, nodePool) => {
    let instanceTypeRAM = 0;
    let currInstanceType = '';

    switch (provider) {
      case Providers.AWS:
        currInstanceType = nodePool.node_spec.aws?.instance_type ?? '';
        instanceTypeRAM =
          (instanceTypes as Record<string, IRawAWSInstanceType>)[
            currInstanceType
          ]?.memory_size_gb ?? 0;

        break;

      case Providers.AZURE:
        currInstanceType = nodePool.node_spec.azure?.vm_size ?? '';
        instanceTypeRAM =
          (instanceTypes as Record<string, IRawAzureInstanceType>)[
            currInstanceType
          ]?.memoryInMb ?? 0;
        // eslint-disable-next-line no-magic-numbers
        instanceTypeRAM = Math.ceil(instanceTypeRAM / 100) / 10;

        break;
    }

    instanceTypeRAM = instanceTypeRAM * nodePool.status.nodes_ready;

    return accumulator + instanceTypeRAM;
  }, 0);

  // eslint-disable-next-line no-magic-numbers
  return Math.ceil(totalRAM * 100) / 100;
}

/**
 * Get total number of CPUs in all node pools.
 * @param nodePools
 */
export function getCpusTotalNodePools(nodePools: INodePool[]) {
  const provider = guessProviderFromNodePools(nodePools);
  if (provider === null) {
    return 0;
  }

  const instanceTypes = getInstanceTypesForProvider(provider);
  if (instanceTypes === null) {
    return 0;
  }

  /**
   * Here we are returning (and accumulating) for each node pool the number
   * of CPUs each instance has multiplied by the number of nodes the node pool has.
   *
   * TODO: When working with Spot Instances a node pool could have different types
   * of instances, and this method will have to be modified.
   */
  const totalCPUs = nodePools.reduce((accumulator, nodePool) => {
    let instanceTypeCPUs = 0;
    let currInstanceType = '';

    switch (provider) {
      case Providers.AWS:
        currInstanceType = nodePool.node_spec.aws?.instance_type ?? '';
        instanceTypeCPUs =
          (instanceTypes as Record<string, IRawAWSInstanceType>)[
            currInstanceType
          ]?.cpu_cores ?? 0;

        break;

      case Providers.AZURE:
        currInstanceType = nodePool.node_spec.azure?.vm_size ?? '';
        instanceTypeCPUs =
          (instanceTypes as Record<string, IRawAzureInstanceType>)[
            currInstanceType
          ]?.numberOfCores ?? 0;

        break;
    }

    instanceTypeCPUs = instanceTypeCPUs * nodePool.status.nodes_ready;

    return accumulator + instanceTypeCPUs;
  }, 0);

  return totalCPUs;
}

/**
 * Determine which features that a cluster supports.
 * @param state - The app's global state.
 */
export const computeCapabilities = (state: IState) => (
  releaseVersion: string,
  provider: PropertiesOf<typeof Providers>
): IClusterCapabilities => {
  let hasOptionalIngress = false;
  let supportsHAMasters = false;

  const minHAMastersVersion = getMinHAMastersVersion(state);

  switch (provider) {
    case Providers.AWS:
      hasOptionalIngress = cmp(releaseVersion, '10.0.99') === 1;
      supportsHAMasters = cmp(releaseVersion, minHAMastersVersion) >= 0;

      break;

    case Providers.AZURE:
      hasOptionalIngress = cmp(releaseVersion, '12.0.0') >= 0;

      break;

    case Providers.KVM:
      hasOptionalIngress = cmp(releaseVersion, '12.2.0') >= 0;

      break;
  }

  return {
    hasOptionalIngress,
    supportsHAMasters,
  };
};

export function filterLabels(labels?: IClusterLabelMap) {
  if (!labels) {
    return undefined;
  }

  const filteredLabels: IClusterLabelMap = {};

  for (const key of Object.keys(labels)) {
    if (validateLabelKey(key).isValid) {
      filteredLabels[key] = labels[key];
    }
  }

  return filteredLabels;
}

/**
 * Get a cluster's latest condition.
 * @param cluster
 */
export function getClusterLatestCondition(
  cluster: V4.ICluster | V5.ICluster
): string | undefined {
  if (
    'conditions' in cluster &&
    cluster.conditions &&
    cluster.conditions.length > 0
  ) {
    return cluster.conditions[0].condition;
  }

  if (
    'status' in cluster &&
    cluster.status &&
    cluster.status.cluster.conditions &&
    cluster.status.cluster.conditions.length > 0
  ) {
    return cluster.status.cluster.conditions[0].type;
  }

  return undefined;
}

/**
 * Check whether a cluster is in a creation state.
 * @param cluster
 */
export function isClusterCreating(cluster: V4.ICluster | V5.ICluster): boolean {
  const latestCondition = getClusterLatestCondition(cluster);
  if (!latestCondition) return true;

  return latestCondition === 'Creating';
}

/**
 * Check whether a cluster is in an updating state.
 * @param cluster
 */
export function isClusterUpdating(cluster: V4.ICluster | V5.ICluster): boolean {
  const latestCondition = getClusterLatestCondition(cluster);

  return latestCondition === 'Updating';
}

/**
 * Check whether a cluster is in a deleting state.
 * @param cluster
 */
export function isClusterDeleting(cluster: V4.ICluster | V5.ICluster): boolean {
  const latestCondition = getClusterLatestCondition(cluster);

  return latestCondition === 'Deleting';
}

/**
 * Try to guess the current provider from a list of node pools.
 * @param nodePools
 */
export function guessProviderFromNodePools(
  nodePools: INodePool[]
): PropertiesOf<typeof Providers> | null {
  if (nodePools.length === 0) {
    return null;
  }

  if (nodePools[0].node_spec.aws) {
    return Providers.AWS;
  } else if (nodePools[0].node_spec.azure) {
    return Providers.AZURE;
  }

  return null;
}

/**
 * Get instance types for an existing provider.
 * @param provider
 */
export function getInstanceTypesForProvider(
  provider: PropertiesOf<typeof Providers>
): Record<string, IRawAWSInstanceType | IRawAzureInstanceType> | null {
  switch (provider) {
    case Providers.AWS:
      if (!window.config.awsCapabilitiesJSON) {
        return null;
      }

      return JSON.parse(window.config.awsCapabilitiesJSON);

    case Providers.AZURE:
      if (!window.config.azureCapabilitiesJSON) {
        return null;
      }

      return JSON.parse(window.config.azureCapabilitiesJSON);

    default:
      return null;
  }
}

export function v4orV5(
  v4func: Function,
  v5func: Function,
  clusterId: string,
  state: IState
) {
  const v5Clusters = state.entities.clusters.v5Clusters;
  const isV5Cluster = v5Clusters.includes(clusterId);

  if (isV5Cluster) {
    return v5func;
  }

  return v4func;
}
