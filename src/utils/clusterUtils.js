import * as moment from 'moment/moment';
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
  if (!window.config.awsCapabilitiesJSON || nodePools.length === 0) {
    return 0;
  }

  const awsInstanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);

  // Here we are returning (and accumulating) for each node pool the number
  // of RAM each instance has multiplied by the number of nodes the node pool has.

  // TODO When working with Spot Instances a node pool could have different types
  // of instances, and this method will have to be modified
  const TotalRAM = nodePools.reduce((accumulator, nodePool) => {
    let instanceTypeRAM = 0;
    if (awsInstanceTypes[nodePool.node_spec.aws.instance_type]) {
      instanceTypeRAM =
        awsInstanceTypes[nodePool.node_spec.aws.instance_type].memory_size_gb;
    }

    return accumulator + instanceTypeRAM * nodePool.status.nodes_ready;
  }, 0);

  return TotalRAM;
}

export function getCpusTotalNodePools(nodePools = []) {
  if (!window.config.awsCapabilitiesJSON || nodePools.length === 0) {
    return 0;
  }

  const awsInstanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);

  // Here we are returning (and accumulating) for each node pool the number
  // of CPUs each instance has multiplied by the number of nodes the node pool has.

  // TODO When working with Spot Instances a node pool could have different types
  // of instances, and this method will have to be modified
  const TotalCPUs = nodePools.reduce((accumulator, nodePool) => {
    let instanceTypeCPUs = 0;
    if (awsInstanceTypes[nodePool.node_spec.aws.instance_type]) {
      instanceTypeCPUs =
        awsInstanceTypes[nodePool.node_spec.aws.instance_type].cpu_cores;
    }

    return accumulator + instanceTypeCPUs * nodePool.status.nodes_ready;
  }, 0);

  return TotalCPUs;
}

// computeCapabilities takes a release version and provider and returns a
// capabilities object with the features that this cluster supports.
export function computeCapabilities(releaseVersion, provider) {
  return {
    hasOptionalIngress:
      provider === Providers.AWS && cmp(releaseVersion, '10.0.99') === 1,
  };
}

export const isClusterYoungerThanOneHour = (createDate) => {
  const creationPlusOneHour = moment(createDate).add(1, 'hour');

  return moment().utc().isBefore(creationPlusOneHour);
};
