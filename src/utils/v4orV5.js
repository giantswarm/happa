export function v4orV5(v4func, v5func, clusterId, state) {
  const v5Clusters = state.entities.clusters.v5Clusters;
  const isV5Cluster = v5Clusters.includes(clusterId);

  if (isV5Cluster) {
    return v5func;
  }

  return v4func;
}
