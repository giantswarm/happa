import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = {
  lastUpdated: null,
  isFetching: false,
  items: {},
  v5Clusters: [],
};

// eslint-disable-next-line complexity
const clusterReducer = produce((draft, action) => {
  switch (action.type) {
    case types.CLUSTERS_LIST_SUCCESS:
      draft.items = action.clusters;
      draft.v5Clusters = action.v5ClusterIds;

      return;

    case types.CLUSTERS_LIST_ERROR:
      draft.errorLoading = true;

      return;

    case types.CLUSTER_LOAD_DETAILS_SUCCESS: {
      draft.items[action.cluster.id] = {
        ...draft.items[action.cluster.id],
        ...action.cluster,
      };

      return;
    }

    case types.CLUSTER_LOAD_DETAILS_ERROR:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].errorLoading = true;
      }

      return;

    case types.CLUSTER_NODEPOOLS_LOAD_SUCCESS:
      draft.items[action.clusterId].nodePools = action.nodePoolsIds;
      draft.items[action.clusterId].resources = action.resources;

      return;

    case types.CLUSTERS_LOAD_NODEPOOLS_SUCCESS:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].nodePools = action.nodePools;
      }

      return;

    case types.CLUSTER_LOAD_STATUS_NOT_FOUND:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].status = null;
      }

      return;

    case types.CLUSTER_LOAD_STATUS_ERROR:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].errorLoading = true;
      }

      return;

    case types.CLUSTER_LOAD_APPS:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].isFetchingApps = true;
      }

      return;

    case types.CLUSTER_LOAD_APPS_SUCCESS:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].isFetchingApps = false;
        draft.items[action.clusterId].apps = action.apps;
      }

      return;

    case types.CLUSTER_LOAD_APPS_ERROR:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].isFetchingApps = false;
      }

      return;

    case types.CLUSTER_LOAD_KEY_PAIRS:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].isFetchingKeyPairs = true;
      }

      return;

    case types.CLUSTER_LOAD_KEY_PAIRS_SUCCESS:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].isFetchingKeyPairs = false;
        draft.items[action.clusterId].keyPairs = action.keyPairs;
      }

      return;

    case types.CLUSTER_LOAD_KEY_PAIRS_ERROR:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].isFetchingKeyPairs = false;
      }

      return;

    case types.CLUSTER_CREATE:
      draft.isFetching = true;

      return;

    case types.V5_CLUSTER_CREATE_SUCCESS:
      draft.v5Clusters.push(action.clusterId);

      return;

    case types.CLUSTER_DELETE_SUCCESS:
      draft.items[action.clusterId].delete_date = action.timestamp;
      draft.lastUpdated = Date.now();

      return;

    case types.CLUSTER_PATCH:
      Object.keys(action.payload).forEach(key => {
        if (draft.items[action.cluster.id]) {
          draft.items[action.cluster.id][key] = action.payload[key];
        }
      });

      return;

    // TODO does this actually work????
    case types.CLUSTER_PATCH_ERROR:
      if (draft.items[action.cluster.id]) {
        draft.items[action.cluster.id] = action.cluster;
      }

      return;

    case types.NODEPOOL_CREATE_SUCCESS:
      draft.items[action.clusterId].nodePools.push(action.nodePool.id);

      return;

    case types.NODEPOOL_DELETE_SUCCESS:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].nodePools = draft.items[
          action.clusterId
        ].nodePools.filter(np => np !== action.nodePoolId);
      }
  }
}, initialState);

export default clusterReducer;
