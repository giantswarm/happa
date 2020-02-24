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

    case types.CLUSTER_LOAD_DETAILS_SUCCESS: {
      draft.items[action.cluster.id] = {
        ...draft.items[action.cluster.id],
        ...action.cluster,
      };

      return;
    }

    case types.CLUSTER_NODEPOOLS_LOAD_SUCCESS:
      draft.items[action.id].nodePools = action.nodePoolsIds;

      return;

    case types.CLUSTER_LOAD_STATUS_NOT_FOUND:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].status = null;
      }

      return;

    case types.CLUSTER_LOAD_APPS_SUCCESS:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].apps = action.apps;
      }

      return;

    case types.CLUSTER_LOAD_KEY_PAIRS_SUCCESS:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].keyPairs = action.keyPairs;
      }

      return;

    case types.V5_CLUSTER_CREATE_SUCCESS:
      draft.v5Clusters.push(action.clusterId);

      return;

    // This is the action that is dispatched when deletion is confirmed in the modal.
    // The cluster is not removed from the store, but it is now marked as a deleted one.
    case types.CLUSTER_DELETE_SUCCESS:
      draft.items[action.clusterId].delete_date = action.timestamp;
      draft.lastUpdated = Date.now();

      return;

    // This is the action that we dipatch in order to actually remove a cluster from the store.
    case types.CLUSTER_DELETE_REQUEST:
      delete draft.items[action.clusterId];
      if (action.isV5) {
        draft.v5Clusters.filter(id => id !== action.clusterId);
      }

      return;

    case types.CLUSTER_PATCH:
      Object.keys(action.payload).forEach(key => {
        if (draft.items[action.cluster.id]) {
          draft.items[action.cluster.id][key] = action.payload[key];
        }
      });

      return;

    // Undo optimistic update
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
