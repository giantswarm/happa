import * as types from 'actions/actionTypes';
import produce from 'immer';

// const spread = produce(Object.assign);

/**
 * Since the API omits the 'aws' key from workers on kvm installations, I will
 * add it back here with dummy values if it is not present.
 *
 * @param {Object} clusterDetails Cluster object
 */
var ensureWorkersHaveAWSkey = function(clusterDetails) {
  clusterDetails.workers = clusterDetails.workers || [];

  for (var i = 0; i < clusterDetails.workers.length; i++) {
    clusterDetails.workers[i].aws = clusterDetails.workers[i].aws || {
      instance_type: '',
    };
  }

  return clusterDetails;
};

const initialState = {
  lastUpdated: null,
  isFetching: false,
  items: {},
  nodePoolsClusters: [],
};

const clusterReducer = produce((draft, action) => {
  switch (action.type) {
    case types.CLUSTERS_LOAD_SUCCESS_V4:
      Object.keys(action.clusters).forEach(clusterId => {
        draft.items[clusterId] = action.clusters[clusterId];
      });
      draft.lastUpdated = action.lastUpdated;
      return;

    case types.CLUSTERS_LOAD_SUCCESS_V5:
      Object.keys(action.clusters).forEach(clusterId => {
        draft.items[clusterId] = action.clusters[clusterId];
      });
      draft.lastUpdated = action.lastUpdated;
      draft.nodePoolsClusters = action.nodePoolsClusters;
      return;

    case types.CLUSTERS_LOAD_ERROR_V4:
    case types.CLUSTERS_LOAD_ERROR_V5:
      draft.errorLoading = true;
      return;

    case types.CLUSTER_LOAD_DETAILS_SUCCESS:
      draft.items[action.cluster.id] = Object.assign(
        {},
        draft.items[action.cluster.id],
        ensureWorkersHaveAWSkey(action.cluster)
      );

      // Fill in scaling values when they aren't supplied.
      if (
        draft.items[action.cluster.id].scaling.min === undefined &&
        draft.items[action.cluster.id].scaling.max === undefined
      ) {
        draft.items[action.cluster.id].scaling.min =
          draft.items[action.cluster.id].workers.length;
        draft.items[action.cluster.id].scaling.max =
          draft.items[action.cluster.id].workers.length;
      }

      return;

    case types.CLUSTER_LOAD_DETAILS_ERROR:
      draft.items[action.cluster.id].errorLoading = true;
      return;

    case types.CLUSTERS_LOAD_NODEPOOLS_SUCCESS:
      draft.items[action.clusterId].nodePools = action.nodePools;
      return;

    case types.CLUSTER_LOAD_STATUS_SUCCESS:
      draft.items[action.clusterId].status = action.status;
      draft.items[action.clusterId].status.lastUpdated = Date.now();
      return;

    case types.CLUSTER_LOAD_STATUS_NOT_FOUND:
      draft.items[action.clusterId].status = null;
      return;

    case types.CLUSTER_LOAD_STATUS_ERROR:
      draft.items[action.clusterId].errorLoading = true;
      return;

    case types.CLUSTER_LOAD_APPS:
      draft.items[action.clusterId].isFetchingApps = true;
      return;

    case types.CLUSTER_LOAD_APPS_SUCCESS:
      draft.items[action.clusterId].isFetchingApps = false;
      // For some reason the array that we get back
      // from the generated js client does not have
      // .map on it. So I make a new one here.
      draft.items[action.clusterId].apps = Array(...action.apps);
      draft.items[action.clusterId].lastUpdated = Date.now();
      return;

    case types.CLUSTER_LOAD_APPS_ERROR:
      draft.items[action.clusterId].isFetchingApps = false;
      draft.items[action.clusterId].lastUpdated = Date.now();
      return;

    case types.CLUSTER_LOAD_KEY_PAIRS:
      draft.items[action.clusterId].isFetchingKeyPairs = true;

      return;

    case types.CLUSTER_LOAD_KEY_PAIRS_SUCCESS:
      draft.items[action.clusterId].isFetchingKeyPairs = false;
      draft.items[action.clusterId].keyPairs = action.keyPairs;
      return;

    case types.CLUSTER_LOAD_KEY_PAIRS_ERROR:
      draft.items[action.clusterId].isFetchingKeyPairs = false;
      return;

    case types.CLUSTER_DELETE_SUCCESS:
      delete draft.items[action.clusterId];
      draft.items[action.clusterId].lastUpdated = Date.now();
      return;

    case types.CLUSTER_PATCH:
      Object.keys(action.payload).forEach(key => {
        draft.items[action.cluster.id][key] = action.payload[key];
      });
      return;

    case types.CLUSTER_PATCH_ERROR:
      draft.items[action.cluster.id] = action.cluster;
      return;
  }
}, initialState);

export default clusterReducer;
