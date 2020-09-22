import { modalHide } from 'actions/modalActions';
import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { IState } from 'reducers/types';
import { ThunkAction } from 'redux-thunk';
import { StatusCodes } from 'shared/constants';
import { INodePool } from 'shared/types';
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
  clusterId: string,
  opts?: { withLoadingFlags: boolean }
): ThunkAction<void, IState, void, NodePoolActions> {
  return function (dispatch) {
    if (opts?.withLoadingFlags) {
      dispatch({ type: CLUSTER_NODEPOOLS_LOAD_REQUEST, id: clusterId });
    }
    const nodePoolsApi = new GiantSwarm.NodePoolsApi();

    return (
      nodePoolsApi
        .getNodePools(clusterId)
        .then((data) => {
          // Receiving an array-like with weird prototype from API call,
          // so converting it to an array.
          const nodePoolsArray = Array.from(data) || [];

          // Dispatch action for populating nodePools key inside cluster
          dispatch({
            type: CLUSTER_NODEPOOLS_LOAD_SUCCESS,
            id: clusterId,
            nodePools: nodePoolsArray, // nodePools
            nodePoolsIds: nodePoolsArray.map((np) => np.id), // array of ids to store in cluster
          });

          return nodePoolsArray;
        })
        // here error.response.status -> delete node pools
        .catch((error) => {
          if (error.response?.status === StatusCodes.NotFound) {
            // If 404, it means that the cluster has been deleted.
            // We want to just log the errors silently, because cluster load
            //action is already triggering an error message so the user knows
            //what's going on.
            dispatch({
              type: CLUSTER_NODEPOOLS_LOAD_ERROR,
              id: clusterId,
              error: 'Node pools not found',
            });

            return;
          }

          dispatch({
            type: CLUSTER_NODEPOOLS_LOAD_ERROR,
            id: clusterId,
            error: error.message,
          });

          let errorMessage =
            'Something went wrong while trying to load node pools on this cluster.';
          if (error.response?.message || error.message) {
            errorMessage = `There was a problem loading node pools: ${
              error.response?.message ?? error.message
            }`;
          }

          new FlashMessage(
            errorMessage,
            messageType.ERROR,
            messageTTL.LONG,
            'Please try again later or contact support: support@giantswarm.io'
          );
        })
    );
  };
}

export function nodePoolsLoad(opts?: {
  filterBySelectedOrganization: boolean;
  withLoadingFlags: boolean;
}): ThunkAction<void, IState, void, NodePoolActions> {
  return async function (dispatch, getState) {
    if (opts?.withLoadingFlags)
      dispatch({ type: NODEPOOL_MULTIPLE_LOAD_REQUEST });

    const selectedOrganization = getState().main.selectedOrganization;
    const allClusters: Record<string, V4.ICluster | V5.ICluster> = getState()
      .entities.clusters.items;
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
        filteredClusters.map((clusterId) =>
          dispatch(clusterNodePoolsLoad(clusterId, { withLoadingFlags: true }))
        )
      );
    }

    if (opts?.withLoadingFlags)
      dispatch({ type: NODEPOOL_MULTIPLE_LOAD_FINISHED });
  };
}

export function nodePoolPatch(
  clusterId: string,
  nodePool: INodePool,
  payload: INodePoolPatchActionPayload
): ThunkAction<void, IState, void, NodePoolActions> {
  return function (dispatch) {
    dispatch({
      type: NODEPOOL_PATCH,
      nodePool,
      payload,
    });

    const nodePoolsApi = new GiantSwarm.NodePoolsApi();

    return nodePoolsApi
      .modifyNodePool(
        clusterId,
        nodePool.id,
        payload as GiantSwarm.V5ModifyNodePoolRequest
      )
      .catch((error) => {
        // Undo update to store if the API call fails.
        dispatch({
          type: NODEPOOL_PATCH_ERROR,
          error,
          nodePool,
        });

        throw error;
      });
  };
}

export function nodePoolDeleteConfirmed(
  clusterId: string,
  nodePool: INodePool
): ThunkAction<void, IState, void, NodePoolActions> {
  return function (dispatch) {
    dispatch({
      type: NODEPOOL_DELETE_CONFIRMED_REQUEST,
      clusterId,
      nodePool,
    });

    const nodePoolsApi = new GiantSwarm.NodePoolsApi();

    return nodePoolsApi
      .deleteNodePool(clusterId, nodePool.id)
      .then(() => {
        dispatch({
          type: NODEPOOL_DELETE_SUCCESS,
          nodePool,
          clusterId,
        });

        // TODO(axbarsan): Remove type cast once modal actions have been typed.
        dispatch(modalHide() as NodePoolActions);

        new FlashMessage(
          `Node Pool <code>${nodePool.id}</code> will be deleted`,
          messageType.INFO,
          messageTTL.SHORT
        );
      })
      .catch((error) => {
        // TODO(axbarsan): Remove type cast once modal actions have been typed.
        dispatch(modalHide() as NodePoolActions);

        new FlashMessage(
          `An error occurred when trying to delete node pool <code>${nodePool.id}</code>.`,
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        return dispatch({
          type: NODEPOOL_DELETE_ERROR,
          nodePoolId: nodePool.id,
          error,
        });
      });
  };
}

export function nodePoolsCreate(
  clusterId: string,
  nodePools: INodePool[],
  opts?: { withFlashMessages: boolean }
): ThunkAction<void, IState, void, NodePoolActions> {
  return async function (dispatch) {
    dispatch({ type: NODEPOOL_MULTIPLE_CREATE_REQUEST });

    const nodePoolsApi = new GiantSwarm.NodePoolsApi();

    const allNodePools = await Promise.all(
      nodePools.map((nodePool) => {
        return nodePoolsApi
          .addNodePool(
            clusterId,
            (nodePool as unknown) as GiantSwarm.V5AddNodePoolRequest
          )
          .then((newNodePool) => {
            dispatch({ type: NODEPOOL_CREATE_REQUEST });

            // When created, there is no status in the response
            const nodePoolWithStatus: INodePool = {
              ...newNodePool,
              status: {
                nodes_ready: 0,
                nodes: 0,
                spot_instances: 0,
                instance_types: null,
              },
            };

            dispatch({
              type: NODEPOOL_CREATE_SUCCESS,
              clusterId,
              nodePool: nodePoolWithStatus,
            });

            if (opts?.withFlashMessages) {
              new FlashMessage(
                `Your new node pool with ID <code>${nodePoolWithStatus.id}</code> is being created.`,
                messageType.SUCCESS,
                messageTTL.MEDIUM
              );
            }

            return nodePoolWithStatus;
          })
          .catch((error) => {
            dispatch({
              type: NODEPOOL_CREATE_ERROR,
              error,
              clusterId,
              nodePool,
            });

            if (opts?.withFlashMessages) {
              new FlashMessage(
                'Something went wrong while trying to create the node pool',
                messageType.ERROR,
                messageTTL.MEDIUM,
                'Please try again later or contact support: support@giantswarm.io'
              );
            }

            throw error;
          });
      })
    );

    dispatch({ type: NODEPOOL_MULTIPLE_CREATE_FINISHED });

    return allNodePools;
  };
}

export const nodePoolDelete = (
  clusterId: string,
  nodePool: INodePool
): NodePoolActions => ({
  type: NODEPOOL_DELETE,
  clusterId,
  nodePool,
});
