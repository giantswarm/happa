import * as types from './actionTypes';

// selectCluster stores a clusterID in the state.
export function selectCluster(clusterID) {
  return { type: types.CLUSTER_SELECT, clusterID: clusterID };
}
