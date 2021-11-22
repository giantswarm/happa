import produce from 'immer';
import { loadClusterApps } from 'model/stores/appcatalog/actions';
import { LOAD_CLUSTER_APPS_SUCCESS } from 'model/stores/appcatalog/constants';
import { AppCatalogActions } from 'model/stores/appcatalog/types';
import {
  CLUSTER_DELETE_SUCCESS,
  CLUSTER_LOAD_DETAILS_SUCCESS,
  CLUSTER_LOAD_KEY_PAIRS_SUCCESS,
  CLUSTER_LOAD_STATUS_NOT_FOUND,
  CLUSTER_PATCH,
  CLUSTER_PATCH_ERROR,
  CLUSTER_REMOVE_FROM_STORE,
  CLUSTERS_LIST_REFRESH_SUCCESS,
  CLUSTERS_LIST_SUCCESS,
  V5_CLUSTER_CREATE_SUCCESS,
} from 'model/stores/cluster/constants';
import { ClusterActions, IClusterState } from 'model/stores/cluster/types';
import { reconcileClustersAwaitingUpgrade } from 'model/stores/cluster/utils';
import { updateClusterLabels } from 'model/stores/clusterlabels/actions';
import { UPDATE_CLUSTER_LABELS_SUCCESS } from 'model/stores/clusterlabels/constants';
import { ClusterLabelsActions } from 'model/stores/clusterlabels/types';
import {
  CLUSTER_NODEPOOLS_LOAD_SUCCESS,
  NODEPOOL_CREATE_SUCCESS,
  NODEPOOL_DELETE_SUCCESS,
} from 'model/stores/nodepool/constants';
import { NodePoolActions } from 'model/stores/nodepool/types';

const initialState: IClusterState = {
  lastUpdated: 0,
  isFetching: false,
  items: {},
  v5Clusters: [],
  idsAwaitingUpgrade: {},
};

const clusterReducer = produce(
  // eslint-disable-next-line complexity
  (
    draft: IClusterState,
    action:
      | ClusterActions
      | NodePoolActions
      | AppCatalogActions
      | ClusterLabelsActions
  ) => {
    switch (action.type) {
      case CLUSTERS_LIST_SUCCESS:
        draft.items = action.clusters;
        draft.v5Clusters = action.v5ClusterIds;
        draft.idsAwaitingUpgrade = reconcileClustersAwaitingUpgrade(
          draft.items,
          draft.idsAwaitingUpgrade
        );

        break;

      case CLUSTERS_LIST_REFRESH_SUCCESS:
        if (Object.keys(action.clusters).length > 0) {
          draft.items = { ...draft.items, ...action.clusters };

          if (action.v5ClusterIds.length > 0) {
            draft.v5Clusters = Array.from(
              new Set([...draft.v5Clusters, ...action.v5ClusterIds])
            );
          }

          draft.idsAwaitingUpgrade = reconcileClustersAwaitingUpgrade(
            draft.items,
            draft.idsAwaitingUpgrade
          );
        }

        break;

      case CLUSTER_LOAD_DETAILS_SUCCESS: {
        const clusterID = action.cluster.id;

        draft.items[clusterID] = {
          ...draft.items[clusterID],
          ...action.cluster,
        };

        if (action.isV5Cluster) {
          if (!draft.v5Clusters.includes(clusterID)) {
            draft.v5Clusters.push(clusterID);
          }
        } else {
          draft.v5Clusters = draft.v5Clusters.filter((id) => id !== clusterID);
        }

        draft.idsAwaitingUpgrade = reconcileClustersAwaitingUpgrade(
          draft.items,
          draft.idsAwaitingUpgrade
        );

        break;
      }

      case CLUSTER_NODEPOOLS_LOAD_SUCCESS: {
        const cluster = draft.items[action.id] as V5.ICluster | undefined;
        if (cluster) {
          cluster.nodePools = action.nodePoolIDs;
        }

        break;
      }

      case CLUSTER_LOAD_STATUS_NOT_FOUND: {
        const cluster = draft.items[action.id] as V4.ICluster | undefined;
        if (cluster) {
          cluster.status = undefined;
        }

        break;
      }

      case loadClusterApps().types
        .success as typeof LOAD_CLUSTER_APPS_SUCCESS: {
        const cluster = draft.items[action.response.clusterId];
        if (cluster) {
          cluster.apps = action.response.apps;
        }

        break;
      }

      case CLUSTER_LOAD_KEY_PAIRS_SUCCESS: {
        const cluster = draft.items[action.clusterId];
        if (cluster) {
          cluster.keyPairs = action.keyPairs;
        }

        break;
      }

      case V5_CLUSTER_CREATE_SUCCESS:
        draft.v5Clusters.push(action.clusterId);

        break;

      case CLUSTER_DELETE_SUCCESS: {
        const cluster = draft.items[action.id];
        if (cluster) {
          cluster.delete_date = new Date(action.timestamp);
          draft.lastUpdated = Date.now();
        }
        draft.idsAwaitingUpgrade = reconcileClustersAwaitingUpgrade(
          draft.items,
          draft.idsAwaitingUpgrade
        );

        break;
      }

      case CLUSTER_REMOVE_FROM_STORE:
        delete draft.items[action.clusterId];
        if (action.isV5Cluster) {
          draft.v5Clusters.filter((id: string) => id !== action.clusterId);
        }
        draft.idsAwaitingUpgrade = reconcileClustersAwaitingUpgrade(
          draft.items,
          draft.idsAwaitingUpgrade
        );

        break;

      case CLUSTER_PATCH: {
        const cluster = draft.items[action.cluster.id];
        if (cluster) {
          for (const [key, value] of Object.entries(action.payload)) {
            // The cluster is waiting for the upgrade process to start.
            if (key === 'release_version' && cluster[key] !== value) {
              draft.idsAwaitingUpgrade[cluster.id] = true;
            }

            // @ts-expect-error
            cluster[key] = value;
          }
        }

        break;
      }

      // Undo optimistic update
      case CLUSTER_PATCH_ERROR: {
        if (draft.items[action.cluster.id]) {
          draft.items[action.cluster.id] = action.cluster;

          delete draft.idsAwaitingUpgrade[action.cluster.id];
        }

        break;
      }

      case NODEPOOL_CREATE_SUCCESS: {
        const cluster = draft.items[action.clusterID] as
          | V5.ICluster
          | undefined;
        if (cluster) {
          cluster.nodePools = [...cluster.nodePools!, action.nodePool.id];
        }

        break;
      }

      case NODEPOOL_DELETE_SUCCESS: {
        const cluster = draft.items[action.clusterID] as
          | V5.ICluster
          | undefined;
        if (cluster?.nodePools) {
          cluster.nodePools = cluster.nodePools.filter(
            (np: string) => np !== action.nodePool.id
          );
        }

        break;
      }

      case updateClusterLabels().types
        .success as typeof UPDATE_CLUSTER_LABELS_SUCCESS: {
        const cluster = draft.items[action.response.clusterId] as
          | V5.ICluster
          | undefined;
        if (cluster) {
          cluster.labels = action.response.labels;
        }

        break;
      }
    }
  },
  initialState
);

export default clusterReducer;
