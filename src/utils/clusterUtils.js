import { getMinHAMastersVersion } from 'selectors/featureSelectors';
import cmp from 'semver-compare';
import { Constants, Providers } from 'shared/constants';

// Here we can store functions that don't return markup/UI and are used in more
// than one component.

// Determine whether a cluster at a certain version can be upgraded to a target version.
export function canClusterUpgrade(currentVersion, targetVersion, provider) {
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

// Regular clusters functions
export function getNumberOfNodes(cluster) {
  if (
    !cluster.status ||
    !cluster.status.cluster.nodes ||
    cluster.status.cluster.nodes.length === 0
  ) {
    return 0;
  }

  const nodes = cluster.status.cluster.nodes;

  let workers = nodes.reduce((accumulator, node) => {
    let newAccumulator = accumulator;

    if (
      node.labels &&
      node.labels.role !== 'master' &&
      node.labels['kubernetes.io/role'] !== 'master'
    ) {
      newAccumulator++;
    }

    return newAccumulator;
  }, 0);

  if (workers === 0) {
    // No node labels available? Fallback to assumption that one of the
    // nodes is master and rest are workers.
    workers = nodes.length - 1;
  }

  return workers;
}

export function getMemoryTotal(workers, memorySizeGB) {
  if (!workers || workers.length === 0) return 0;

  return (workers * memorySizeGB).toFixed(2);
}

export function getStorageTotal(cluster) {
  const workers = getNumberOfNodes(cluster);
  if (!workers || !cluster.workers || cluster.workers.length === 0) {
    return null;
  }
  const s = workers * cluster.workers[0].storage.size_gb;

  return s.toFixed(2);
}

export function getCpusTotal(numberOfNodes, workers) {
  if (!numberOfNodes || !workers || workers.length === 0) {
    return null; // TODO refactor this and return 0 instead, this is a function that should return a total
  }

  return numberOfNodes * workers[0].cpu.cores;
}

// Node pools clusters functions.
export function getNumberOfNodePoolsNodes(nodePools = []) {
  if (nodePools.length === 0) return 0;

  return nodePools.reduce((accumulator, current) => {
    return accumulator + current.status.nodes;
  }, 0);
}

export function getMemoryTotalNodePools(nodePools = []) {
  const provider = guessProviderFromNodePools(nodePools);
  if (provider === null) {
    return 0;
  }

  const instanceTypes = getInstanceTypesForProvider(provider);
  if (instanceTypes === null) {
    return 0;
  }

  // Here we are returning (and accumulating) for each node pool the number
  // of RAM each instance has multiplied by the number of nodes the node pool has.

  // TODO When working with Spot Instances a node pool could have different types
  // of instances, and this method will have to be modified
  const TotalRAM = nodePools.reduce((accumulator, nodePool) => {
    let instanceTypeRAM = 0;
    let currInstanceType = '';

    switch (provider) {
      case Providers.AWS:
        currInstanceType = nodePool.node_spec.aws.instance_type;
        instanceTypeRAM = instanceTypes[currInstanceType]?.memory_size_gb ?? 0;

        break;

      case Providers.AZURE:
        currInstanceType = nodePool.node_spec.azure.vm_size;
        instanceTypeRAM = instanceTypes[currInstanceType]?.memoryInMb ?? 0;
        // eslint-disable-next-line no-magic-numbers
        instanceTypeRAM = (instanceTypeRAM / 1000).toFixed(1);

        break;
    }

    instanceTypeRAM = instanceTypeRAM * nodePool.status.nodes_ready;

    return accumulator + instanceTypeRAM;
  }, 0);

  return TotalRAM;
}

export function getCpusTotalNodePools(nodePools = []) {
  const provider = guessProviderFromNodePools(nodePools);
  if (provider === null) {
    return 0;
  }

  const instanceTypes = getInstanceTypesForProvider(provider);
  if (instanceTypes === null) {
    return 0;
  }

  // Here we are returning (and accumulating) for each node pool the number
  // of CPUs each instance has multiplied by the number of nodes the node pool has.

  // TODO When working with Spot Instances a node pool could have different types
  // of instances, and this method will have to be modified
  const TotalCPUs = nodePools.reduce((accumulator, nodePool) => {
    let instanceTypeCPUs = 0;
    let currInstanceType = '';

    switch (provider) {
      case Providers.AWS:
        currInstanceType = nodePool.node_spec.aws.instance_type;
        instanceTypeCPUs = instanceTypes[currInstanceType]?.cpu_cores ?? 0;

        break;

      case Providers.AZURE:
        currInstanceType = nodePool.node_spec.azure.vm_size;
        instanceTypeCPUs = instanceTypes[currInstanceType]?.numberOfCores ?? 0;

        break;
    }

    instanceTypeCPUs = instanceTypeCPUs * nodePool.status.nodes_ready;

    return accumulator + instanceTypeCPUs;
  }, 0);

  return TotalCPUs;
}

/**
 * This function takes a release version and provider and returns a
 * capabilities object with the features that this cluster supports.
 * @param state {IState} - The app's global state.
 * @returns {function (string, string): {hasOptionalIngress: boolean, supportsHAMasters: boolean}}
 */
export const computeCapabilities = (state) => (releaseVersion, provider) => {
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

export const filterLabels = (labels) => {
  if (!labels) {
    return undefined;
  }

  const filteredLabels = {};

  for (const key of Object.keys(labels)) {
    if (
      key.includes(Constants.RESTRICTED_CLUSTER_LABEL_KEY_SUBSTRING) === false
    ) {
      filteredLabels[key] = labels[key];
    }
  }

  return filteredLabels;
};

/**
 * Check whether the given condition is a cluster's latest condition.
 * @param cluster {Object} - The cluster object.
 * @param conditionToCheck {string} - The name of the condition to check for.
 * @returns {boolean}
 */
export function hasClusterLatestCondition(cluster, conditionToCheck) {
  if (!cluster.conditions || cluster.conditions.length === 0) return false;

  return cluster.conditions[0].condition === conditionToCheck;
}

/**
 * Check whether a cluster is in creation state.
 * @param cluster {Object} - The cluster object.
 * @returns {boolean}
 */
export function isClusterCreating(cluster) {
  if (!cluster.conditions || cluster.conditions.length === 0) return true;

  const conditionToCheck = 'Creating';

  return hasClusterLatestCondition(cluster, conditionToCheck);
}

/**
 * Check whether a cluster is in updating state.
 * @param cluster {Object} - The cluster object.
 * @returns {boolean}
 */
export function isClusterUpdating(cluster) {
  const conditionToCheck = 'Updating';

  return hasClusterLatestCondition(cluster, conditionToCheck);
}

/**
 * Check whether a cluster is in deleting state.
 * @param cluster {Object} - The cluster object.
 * @returns {boolean}
 */
export function isClusterDeleting(cluster) {
  const conditionToCheck = 'Deleting';

  return hasClusterLatestCondition(cluster, conditionToCheck);
}

/**
 * Try to guess the current provider from a list of node pools.
 * @param nodePools
 * @return {string|null}
 */
export function guessProviderFromNodePools(nodePools) {
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
 * @return {null|Record<string,any>}
 */
export function getInstanceTypesForProvider(provider) {
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
