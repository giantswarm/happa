import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { IState } from 'reducers/types';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { StatusCodes } from 'shared/constants';
import { INodePool } from 'shared/types';
import { modalHide } from 'stores/modal/actions';
import { ModalActions } from 'stores/modal/types';
import {
  CLUSTER_NODEPOOLS_LOAD_ERROR,
  CLUSTER_NODEPOOLS_LOAD_REQUEST,
  CLUSTER_NODEPOOLS_LOAD_SUCCESS,
  NODEPOOL_CREATE_ERROR,
  NODEPOOL_CREATE_REQUEST,
  NODEPOOL_CREATE_SUCCESS,
  NODEPOOL_DELETE,
  NODEPOOL_DELETE_CONFIRMED_REQUEST,
  NODEPOOL_DELETE_ERROR,
  NODEPOOL_DELETE_SUCCESS,
  NODEPOOL_MULTIPLE_CREATE_FINISHED,
  NODEPOOL_MULTIPLE_CREATE_REQUEST,
  NODEPOOL_MULTIPLE_LOAD_FINISHED,
  NODEPOOL_MULTIPLE_LOAD_REQUEST,
  NODEPOOL_PATCH,
  NODEPOOL_PATCH_ERROR,
} from 'stores/nodepool/constants';
import {
  INodePoolPatchActionPayload,
  NodePoolActions,
} from 'stores/nodepool/types';

export function clusterNodePoolsLoad(
  clusterID: string,
  opts?: { withLoadingFlags?: boolean }
): ThunkAction<void, IState, void, NodePoolActions> {
  return async (dispatch) => {
    try {
      if (opts?.withLoadingFlags) {
        dispatch({ type: CLUSTER_NODEPOOLS_LOAD_REQUEST, id: clusterID });
      }
      const nodePoolsApi = new GiantSwarm.NodePoolsApi();

      const response = await nodePoolsApi.getNodePools(clusterID);
      // The response received has an `ArrayLike` data type.
      const nodePools = Array.from(response);
      const nodePoolIDs = nodePools.map((np) => np.id);

      dispatch({
        type: CLUSTER_NODEPOOLS_LOAD_SUCCESS,
        id: clusterID,
        nodePools,
        nodePoolIDs,
      });
    } catch (err) {
      if (err.response?.status === StatusCodes.NotFound) {
        /**
         * If the status code is 404, it means that the cluster
         * has been deleted. We want to just log the errors
         * silently, because the cluster load action is already
         * displaying an error message.
         */
        dispatch({
          type: CLUSTER_NODEPOOLS_LOAD_ERROR,
          id: clusterID,
          error: 'Node pools not found',
        });

        return;
      }

      dispatch({
        type: CLUSTER_NODEPOOLS_LOAD_ERROR,
        id: clusterID,
        error: err.message,
      });

      let errorMessage =
        'Something went wrong while trying to load node pools on this cluster.';
      if (err.response?.message || err.message) {
        errorMessage = `There was a problem loading node pools: ${
          err.response?.message ?? err.message
        }`;
      }

      new FlashMessage(
        errorMessage,
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );
    }
  };
}

export function nodePoolsLoad(opts?: {
  filterBySelectedOrganization?: boolean;
  withLoadingFlags?: boolean;
}): ThunkAction<void, IState, void, NodePoolActions> {
  return async (dispatch, getState) => {
    if (opts?.withLoadingFlags)
      dispatch({ type: NODEPOOL_MULTIPLE_LOAD_REQUEST });

    const selectedOrganization = getState().main.selectedOrganization;
    const allClusters = getState().entities.clusters.items;
    const v5ClusterIDs: string[] =
      getState().entities.clusters.v5Clusters || [];

    const filteredClusters = v5ClusterIDs.filter((id) => {
      const cluster = allClusters[id];
      if (!cluster) return false;

      // Remove deleted clusters.
      if (cluster.delete_date) return false;

      if (
        opts?.filterBySelectedOrganization &&
        cluster.owner !== selectedOrganization
      ) {
        return false;
      }

      return true;
    });

    if (filteredClusters.length > 0) {
      await Promise.all(
        filteredClusters.map((clusterID) =>
          dispatch(clusterNodePoolsLoad(clusterID, { withLoadingFlags: true }))
        )
      );
    }

    if (opts?.withLoadingFlags)
      dispatch({ type: NODEPOOL_MULTIPLE_LOAD_FINISHED });
  };
}

export function nodePoolPatch(
  clusterID: string,
  nodePool: INodePool,
  payload: INodePoolPatchActionPayload
): ThunkAction<void, IState, void, NodePoolActions> {
  return async (dispatch) => {
    try {
      dispatch({
        type: NODEPOOL_PATCH,
        nodePool,
        payload,
      });

      const nodePoolsApi = new GiantSwarm.NodePoolsApi();
      await nodePoolsApi.modifyNodePool(
        clusterID,
        nodePool.id,
        payload as GiantSwarm.V5ModifyNodePoolRequest
      );
    } catch (err) {
      // Undo update to store if the API call fails.
      dispatch({
        type: NODEPOOL_PATCH_ERROR,
        error: err,
        nodePool,
      });

      throw err;
    }
  };
}

export function nodePoolDeleteConfirmed(
  clusterID: string,
  nodePool: INodePool
): ThunkAction<void, IState, void, NodePoolActions | ModalActions> {
  return async (dispatch) => {
    try {
      dispatch({
        type: NODEPOOL_DELETE_CONFIRMED_REQUEST,
        clusterID,
        nodePool,
      });

      const nodePoolsApi = new GiantSwarm.NodePoolsApi();
      await nodePoolsApi.deleteNodePool(clusterID, nodePool.id);

      dispatch({
        type: NODEPOOL_DELETE_SUCCESS,
        clusterID,
        nodePool,
      });

      dispatch(modalHide());

      new FlashMessage(
        `Node Pool <code>${nodePool.id}</code> will be deleted`,
        messageType.INFO,
        messageTTL.SHORT
      );
    } catch (err) {
      dispatch(modalHide());

      new FlashMessage(
        `An error occurred when trying to delete node pool <code>${nodePool.id}</code>.`,
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      dispatch({
        type: NODEPOOL_DELETE_ERROR,
        nodePoolID: nodePool.id,
        error: err,
      });
    }
  };
}

function makeNodePoolCreator(
  nodePoolsApi: GiantSwarm.NodePoolsApi,
  dispatch: ThunkDispatch<IState, void, NodePoolActions>,
  clusterID: string,
  emitFlashMessage: boolean
) {
  const defaults: Partial<INodePool> = {
    status: {
      nodes_ready: 0,
      nodes: 0,
      spot_instances: 0,
      instance_types: null,
    },
  };

  return async (nodePool: INodePool) => {
    try {
      dispatch({ type: NODEPOOL_CREATE_REQUEST });

      const response = await nodePoolsApi.addNodePool(
        clusterID,
        (nodePool as unknown) as GiantSwarm.V5AddNodePoolRequest
      );
      const newNodePool: INodePool = {
        ...response,
        ...defaults,
      };

      dispatch({
        type: NODEPOOL_CREATE_SUCCESS,
        clusterID,
        nodePool: newNodePool,
      });

      if (emitFlashMessage) {
        new FlashMessage(
          `Your new node pool with ID <code>${newNodePool.id}</code> is being created.`,
          messageType.SUCCESS,
          messageTTL.MEDIUM
        );
      }

      return nodePool;
    } catch (err) {
      dispatch({
        type: NODEPOOL_CREATE_ERROR,
        error: err,
        clusterID,
        nodePool,
      });

      if (emitFlashMessage) {
        new FlashMessage(
          'Something went wrong while trying to create the node pool',
          messageType.ERROR,
          messageTTL.MEDIUM,
          'Please try again later or contact support: support@giantswarm.io'
        );
      }

      throw err;
    }
  };
}

export function nodePoolsCreate(
  clusterID: string,
  nodePools: INodePool[],
  opts?: { withFlashMessages?: boolean }
): ThunkAction<void, IState, void, NodePoolActions> {
  return async (dispatch) => {
    dispatch({ type: NODEPOOL_MULTIPLE_CREATE_REQUEST });

    const nodePoolsApi = new GiantSwarm.NodePoolsApi();
    const requests = nodePools.map(
      makeNodePoolCreator(
        nodePoolsApi,
        dispatch,
        clusterID,
        opts?.withFlashMessages ?? false
      )
    );
    await Promise.all(requests);

    dispatch({ type: NODEPOOL_MULTIPLE_CREATE_FINISHED });
  };
}

export const nodePoolDelete = (
  clusterID: string,
  nodePool: INodePool
): NodePoolActions => ({
  type: NODEPOOL_DELETE,
  clusterID,
  nodePool,
});
