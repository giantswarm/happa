import { createSelector } from 'reselect';
import {
  getCpusTotalNEW,
  getMemoryTotalNEW,
  getNumberOfNodes,
  getStorageTotal,
} from 'utils/clusterUtils';

// Regular selectors
const selectClusterById = (state, props) => {
  return state.entities.clusters.items[props.cluster.id];
};

// Memoized Reselect selectors
// https://github.com/reduxjs/reselect#createselectorinputselectors--inputselectors-resultfunc
export const selectComputedResources = createSelector(
  selectClusterById,
  cluster => {
    // In case status call fails.
    if (
      !(
        cluster.path.startsWith('/v4') &&
        cluster.status &&
        cluster.status.cluster.nodes &&
        cluster.status.cluster.nodes.length !== 0
      )
    ) {
      return { numberOfNodes: 0, memory: 0, cores: 0, storage: 0 };
    }

    const numberOfNodes = getNumberOfNodes(cluster);
    const memory = getMemoryTotalNEW(
      numberOfNodes,
      cluster.workers[0].memory.size_gb // workers are not stored yet
    );
    const cores = getCpusTotalNEW(numberOfNodes, cluster.workers);
    // Filter for just KVM in components
    const storage = getStorageTotal(cluster);

    return { numberOfNodes, memory, cores, storage };
  }
);
