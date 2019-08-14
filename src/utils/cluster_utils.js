// Here we can store functions that don't return markup/UI and are used in more
// than one component.

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
    if (
      node.labels &&
      node.labels['role'] !== 'master' &&
      node.labels['kubernetes.io/role'] !== 'master'
    ) {
      accumulator++;
    }
    return accumulator;
  }, 0);

  if (workers === 0) {
    // No node labels available? Fallback to assumption that one of the
    // nodes is master and rest are workers.
    workers = nodes.length - 1;
  }

  return workers;
}

export function getMemoryTotal(cluster) {
  var workers = getNumberOfNodes(cluster);

  console.log(cluster.workers);

  if (!workers || !cluster.workers || cluster.workers.length === 0) {
    return null;
  }
  var m = workers * cluster.workers[0].memory.size_gb;
  return m.toFixed(2);
}

export function getStorageTotal(cluster) {
  var workers = getNumberOfNodes(cluster);
  if (!workers || !cluster.workers || cluster.workers.length === 0) {
    return null;
  }
  var s = workers * cluster.workers[0].storage.size_gb;
  return s.toFixed(2);
}

export function getCpusTotal(cluster) {
  var workers = getNumberOfNodes(cluster);
  if (!workers || !cluster.workers || cluster.workers.length === 0) {
    return null;
  }
  return workers * cluster.workers[0].cpu.cores;
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
    return;
  }

  const awsInstanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);

  // Here we are returning (and accumulating) for each node pool the number
  // of RAM each instance has multiplied by the number of nodes the node pool has.

  // TODO When working with Spot Instances a node pool could have different types
  // of instances, and this method will have to be modified
  const TotalRAM = nodePools.reduce((accumulator, nodePool) => {
    const instanceTypeRAM =
      awsInstanceTypes[nodePool.node_spec.aws.instance_type].memory_size_gb;
    return accumulator + instanceTypeRAM * nodePool.status.nodes_ready;
  }, 0);

  return TotalRAM;
}

export function getCpusTotalNodePools(nodePools = []) {
  if (!window.config.awsCapabilitiesJSON || nodePools.length === 0) {
    return;
  }

  const awsInstanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);

  // Here we are returning (and accumulating) for each node pool the number
  // of CPUs each instance has multiplied by the number of nodes the node pool has.

  // TODO When working with Spot Instances a node pool could have different types
  // of instances, and this method will have to be modified
  const TotalCPUs = nodePools.reduce((accumulator, nodePool) => {
    const instanceTypeCPUs =
      awsInstanceTypes[nodePool.node_spec.aws.instance_type].cpu_cores;
    return accumulator + instanceTypeCPUs * nodePool.status.nodes_ready;
  }, 0);

  return TotalCPUs;
}

// Finds node pools for a cluster and returns an array of node pools objects
export const clusterNodePools = (nodePools, cluster) => {
  return cluster.nodePools.map(np => {
    return nodePools[np];
  });
};
