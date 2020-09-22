import * as types from 'actions/actionTypes';
import produce from 'immer';
import { loadClusterApps } from 'stores/clusterapps/actions';
import { updateClusterLabels } from 'stores/clusterlabels/actions';
import {
  CLUSTER_NODEPOOLS_LOAD_SUCCESS,
  NODEPOOL_CREATE_SUCCESS,
  NODEPOOL_DELETE_SUCCESS,
} from 'stores/nodepool/constants';

const initialState = {
  lastUpdated: null,
  isFetching: false,
  items: {},
  v5Clusters: [],
  allIds: [],
};

// eslint-disable-next-line complexity
const clusterReducer = produce((draft, action) => {
  switch (action.type) {
    case types.CLUSTERS_LIST_SUCCESS:
      draft.items = action.clusters;
      draft.v5Clusters = action.v5ClusterIds;
      draft.allIds = action.allIds;

      return;

    case types.CLUSTERS_LIST_REFRESH_SUCCESS:
      if (Object.keys(action.clusters).length > 0) {
        draft.items = { ...draft.items, ...action.clusters };

        if (action.v5ClusterIds.length > 0) {
          draft.v5Clusters = Array.from(
            new Set([...draft.v5Clusters, ...action.v5ClusterIds])
          );
        }
      }

      return;

    case types.CLUSTER_LOAD_DETAILS_SUCCESS: {
      draft.items[action.cluster.id] = {
        ...draft.items[action.cluster.id],
        ...action.cluster,
      };

      return;
    }

    case CLUSTER_NODEPOOLS_LOAD_SUCCESS:
      draft.items[action.id].nodePools = action.nodePoolsIds;

      return;

    case types.CLUSTER_LOAD_STATUS_NOT_FOUND:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].status = null;
      }

      return;

    case loadClusterApps().types.success:
      if (draft.items[action.response.clusterId]) {
        draft.items[action.response.clusterId].apps = action.response.apps;
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

    // This is the action that we dispatch in order to actually remove a cluster from the store.
    case types.CLUSTER_REMOVE_FROM_STORE:
      delete draft.items[action.clusterId];
      if (action.isV5Cluster) {
        draft.v5Clusters.filter((id: string) => id !== action.clusterId);
      }

      return;

    case types.CLUSTER_PATCH:
      Object.keys(action.payload).forEach((key) => {
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

    case NODEPOOL_CREATE_SUCCESS:
      draft.items[action.clusterId].nodePools.push(action.nodePool.id);

      return;

    case NODEPOOL_DELETE_SUCCESS:
      if (draft.items[action.clusterId]) {
        draft.items[action.clusterId].nodePools = draft.items[
          action.clusterId
        ].nodePools.filter((np: string) => np !== action.nodePoolId);
      }

      return;

    case updateClusterLabels().types.success:
      if (draft.items[action.response.clusterId]) {
        draft.items[action.response.clusterId].labels = action.response.labels;
      }
  }
}, initialState);

export default clusterReducer;
