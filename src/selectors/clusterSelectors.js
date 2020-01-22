import { createSelector } from 'reselect';
import {
  getCpusTotal,
  getCpusTotalNodePools,
  getMemoryTotal,
  getMemoryTotalNodePools,
  getNumberOfNodePoolsNodes,
  getNumberOfNodes,
  getStorageTotal,
} from 'utils/clusterUtils';

// Regular selectors
const selectClusterById = (state, props) => {
  return state.entities.clusters.items[props.cluster.id];
};

const selectNodePools = state => state.entities.nodePools.items;

const selectClusterNodePoolsIds = (state, props) => {
  return state.entities.clusters.items[props.cluster.id].nodePools;
};

// Memoized Reselect selectors
// TODO not memoizing correctly, state in store is not modified... investigate further
// https://github.com/reduxjs/reselect#createselectorinputselectors--inputselectors-resultfunc
export const selectResourcesV4 = () =>
  createSelector(selectClusterById, cluster => {
    // In case status call fails.
    if (
      !cluster ||
      !cluster.status ||
      !cluster.status.cluster.nodes ||
      cluster.status.cluster.nodes.length === 0
    ) {
      return { numberOfNodes: 0, memory: 0, cores: 0, storage: 0 };
    }

    const numberOfNodes = getNumberOfNodes(cluster);
    const memory = getMemoryTotal(
      numberOfNodes,
      cluster.workers[0].memory.size_gb // workers are not stored yet
    );
    const cores = getCpusTotal(numberOfNodes, cluster.workers);
    // Filter for just KVM in components
    const storage = getStorageTotal(cluster);

    return { numberOfNodes, memory, cores, storage };
  });

export const selectResourcesV5 = () =>
  createSelector(
    [selectNodePools, selectClusterNodePoolsIds],
    (nodePools, clusterNodePoolsIds) => {
      // TODO This is not being memoized correctly, investigate further
      const clusterNodePools =
        // nodePools &&
        Object.entries(nodePools).length !== 0 && clusterNodePoolsIds
          ? clusterNodePoolsIds.map(np => nodePools[np])
          : [];

      const numberOfNodes = getNumberOfNodePoolsNodes(clusterNodePools);
      const memory = getMemoryTotalNodePools(clusterNodePools);
      const cores = getCpusTotalNodePools(clusterNodePools);

      return { numberOfNodes, memory, cores };
    }
  );
