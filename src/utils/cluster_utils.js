// Here we can store functions that don't return markup/UI and are used in more
// than one component.

// Regular clusters functions
export function getNumberOfNodes(cluster) {
  if (
    !cluster.status ||
    !cluster.status.nodes ||
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

  if (workers === null || workers === 0 || !cluster.workers) {
    return null;
  }
  var m = workers * cluster.workers[0].memory.size_gb;
  return m.toFixed(2);
}

export function getStorageTotal(cluster) {
  var workers = getNumberOfNodes(cluster);
  if (workers === null || workers === 0 || !cluster.workers) {
    return null;
  }
  var s = workers * cluster.workers[0].storage.size_gb;
  return s.toFixed(2);
}

export function getCpusTotal(cluster) {
  var workers = getNumberOfNodes(cluster);
  if (workers === null || workers === 0 || !cluster.workers) {
    return null;
  }
  return workers * cluster.workers[0].cpu.cores;
}

// Node pools clusters functions.
export function getNumberOfNodePoolsNodes(cluster) {
  const { nodePools } = cluster;

  if (!nodePools || nodePools.length === 0) return 0;

  return nodePools.reduce((accumulator, current) => {
    return accumulator + current.status.nodes;
  }, 0);
}

export function getMemoryTotalNodePools(cluster) {
  if (!window.config.awsCapabilitiesJSON || !cluster.nodePools) {
    return;
  }

  const { nodePools } = cluster;
  const nodes = getNumberOfNodePoolsNodes(cluster);
  const awsInstanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);

  const TotalRAM = nodePools.reduce((accumulator, nodePool) => {
    const nodePoolRAM =
      awsInstanceTypes[nodePool.node_spec.aws.instance_type].memory_size_gb;
    return accumulator + nodePoolRAM;
  }, 0);

  return TotalRAM * nodes;
}

export function getCpusTotalNodePools(cluster) {
  if (!window.config.awsCapabilitiesJSON || !cluster.nodePools) {
    return;
  }

  const nodes = getNumberOfNodePoolsNodes(cluster);
  const awsInstanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);

  const TotalCPUs = cluster.nodePools.reduce((accumulator, nodePool) => {
    const nodePoolCPUs =
      awsInstanceTypes[nodePool.node_spec.aws.instance_type].cpu_cores;
    return accumulator + nodePoolCPUs;
  }, 0);

  return TotalCPUs * nodes;
}
