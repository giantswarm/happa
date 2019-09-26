import * as types from 'actions/actionTypes';
import produce from 'immer';

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
    case types.CLUSTERS_LOAD_SUCCESS:
      Object.keys(action.v4Clusters).forEach(clusterId => {
        const withAwsKeys = ensureWorkersHaveAWSkey(
          action.v4Clusters[clusterId]
        );

        draft.items[clusterId] = action.v4Clusters[clusterId];
        draft.items[clusterId].workers = withAwsKeys.workers;
      });

      Object.keys(action.v5Clusters).forEach(clusterId => {
        draft.items[clusterId] = action.v5Clusters[clusterId];
      });
      draft.lastUpdated = action.lastUpdated;
      draft.nodePoolsClusters = action.nodePoolsClusters;
      return;

    case types.CLUSTERS_LOAD_ERROR:
      draft.errorLoading = true;
      return;

    case types.CLUSTER_LOAD_DETAILS_SUCCESS: {
      const withAwsKeys = ensureWorkersHaveAWSkey(action.cluster);
      draft.items[action.cluster.id] = {
        ...draft.items[action.cluster.id],
        ...action.cluster,
        workers: withAwsKeys.workers,
      };

      // Fill in scaling values when they aren't supplied.
      const { scaling, workers } = draft.items[action.cluster.id];

      if (!scaling.min && !scaling.max) {
        scaling.min = workers.length;
        scaling.max = workers.length;
      }

      return;
    }

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
      draft.lastUpdated = Date.now();
      return;

    case types.CLUSTER_PATCH:
      Object.keys(action.payload).forEach(key => {
        draft.items[action.cluster.id][key] = action.payload[key];
      });
      return;

    case types.CLUSTER_PATCH_ERROR:
      draft.items[action.cluster.id] = action.cluster;
      return;

    case types.NODEPOOL_CREATE_SUCCESS:
      draft.items[action.clusterId].nodePools.push(action.nodePool.id);
      return;
  }
}, initialState);

export default clusterReducer;
