import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';

import * as types from './actionTypes';
import { modalHide } from './modalActions';

// API instantiations.
const nodePoolsApi = new GiantSwarm.NodePoolsApi();

// Loads one cluster node pools
export function clusterNodePoolsLoad(clusterId, { withLoadingFlags }) {
  return function(dispatch) {
    if (withLoadingFlags) {
      dispatch({ type: types.CLUSTER_NODEPOOLS_LOAD_REQUEST });
    }

    return nodePoolsApi
      .getNodePools(clusterId)
      .then(data => {
        // Receiving an array-like with weird prototype from API call,
        // so converting it to an array.
        const nodePoolsArray = Array.from(data) || [];

        // Dispatch action for populating nodePools key inside cluster
        dispatch({
          type: types.CLUSTER_NODEPOOLS_LOAD_SUCCESS,
          clusterId,
          nodePools: nodePoolsArray, // nodePools
          nodePoolsIds: nodePoolsArray.map(np => np.id), // array of ids to store in cluster
        });

        return nodePoolsArray;
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Error loading cluster node pools:', error);

        dispatch({
          type: types.CLUSTER_NODEPOOLS_LOAD_ERROR,
          error,
        });

        new FlashMessage(
          'Something went wrong while trying to load node pools on this cluster.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );
      });
  };
}

// Loads all node pools for all v5 clusters in store.
export function nodePoolsLoad() {
  return async function(dispatch, getState) {
    dispatch({ type: types.NODEPOOLS_LOAD_REQUEST });

    const v5ClustersId = getState().entities.clusters.v5Clusters || [];
    if (v5ClustersId.length > 0) {
      await Promise.all(
        v5ClustersId.map(clusterId =>
          dispatch(clusterNodePoolsLoad(clusterId, { withLoadingFlags: true }))
        )
      );
    }

    dispatch({ type: types.NODEPOOLS_LOAD_FINISHED });
  };
}

/**
 * Takes a nodePool object with its cluster id and tries to patch it.
 * Dispatches NODEPOOL_PATCH on patch and NODEPOOL_PATCH_ERROR
 * on error.
 *
 * @param {String} clusterId
 * @param {Object} nodePool Node Pool object
 * @param {Object} payload Modification object
 */
export function nodePoolPatch(clusterId, nodePool, payload) {
  return function(dispatch) {
    // eslint-disable-next-line no-use-before-define
    dispatch(nodePoolPatchAction(nodePool, payload));

    return nodePoolsApi
      .modifyNodePool(clusterId, nodePool.id, payload)
      .catch(error => {
        // Undo update to store if the API call fails.
        // eslint-disable-next-line no-use-before-define
        dispatch(nodePoolPatchError(error, nodePool));

        new FlashMessage(
          'Something went wrong while trying to update the node pool name',
          messageType.ERROR,
          messageTTL.MEDIUM,
          'Please try again later or contact support: support@giantswarm.io'
        );

        // eslint-disable-next-line no-console
        console.error(error);

        throw error;
      });
  };
}

/**
 * Takes a node pool object and deletes that node pool. Dispatches NODEPOOL_DELETE_SUCCESS
 * on success or NODEPOOL_DELETE_ERROR on error.
 *
 * @param {Object} nodePool Node Pool object
 */
export function nodePoolDeleteConfirmed(clusterId, nodePool) {
  return function(dispatch) {
    dispatch({
      type: types.NODEPOOL_DELETE_CONFIRMED,
      clusterId,
      nodePool,
    });

    return nodePoolsApi
      .deleteNodePool(clusterId, nodePool.id)
      .then(() => {
        // eslint-disable-next-line no-use-before-define
        dispatch(nodePoolDeleteSuccess(nodePool.id, clusterId));

        dispatch(modalHide());

        new FlashMessage(
          `Node Pool <code>${nodePool.id}</code> will be deleted`,
          messageType.INFO,
          messageTTL.SHORT
        );
      })
      .catch(error => {
        dispatch(modalHide());

        new FlashMessage(
          `An error occurred when trying to delete node pool <code>${nodePool.id}</code>.`,
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        // eslint-disable-next-line no-console
        console.error(error);

        // eslint-disable-next-line no-use-before-define
        return dispatch(nodePoolDeleteError(nodePool.id, error));
      });
  };
}

/**
 * Takes an array of node pool objects and tries to create each one.
 * This way we have a unique function that can be used in v5 cluster creation form and when
 * adding multiple node pools from the v5 cluster details view
 * Dispatches NODEPOOL_CREATE_SUCCESS on success or NODEPOOL_CREATE_ERROR on error.
 *
 * @param {Array} nodePools Array of Node Pool definition objects
 */
export function nodePoolsCreate(clusterId, nodePools) {
  return async function(dispatch) {
    dispatch({ type: types.NODEPOOLS_CREATE });

    const allNodePools = await Promise.all(
      nodePools.map(nodePool => {
        return nodePoolsApi
          .addNodePool(clusterId, nodePool)
          .then(newNodePool => {
            // When created no status in the response
            const nodePoolWithStatus = {
              ...newNodePool,
              status: { nodes_ready: 0, nodes: 0 },
            };

            dispatch({
              type: types.NODEPOOL_CREATE_SUCCESS,
              clusterId,
              nodePool: nodePoolWithStatus,
            });

            new FlashMessage(
              `Your new node pool with ID <code>${nodePoolWithStatus.id}</code> is being created.`,
              messageType.SUCCESS,
              messageTTL.MEDIUM
            );

            return nodePoolWithStatus;
          })
          .catch(error => {
            dispatch({
              type: types.NODEPOOL_CREATE_ERROR,
              error,
              clusterId,
              nodePool,
            });

            new FlashMessage(
              'Something went wrong while trying to create the node pool',
              messageType.ERROR,
              messageTTL.MEDIUM,
              'Please try again later or contact support: support@giantswarm.io'
            );

            // eslint-disable-next-line no-console
            console.error(error);

            throw error;
          });
      })
    );

    // Dispatch action for populating nodePools key inside clusters
    // dispatch(nodePoolsLoad());

    return allNodePools;
  };
}

// Actions
const nodePoolPatchAction = (nodePool, payload) => ({
  type: types.NODEPOOL_PATCH,
  nodePool,
  payload,
});

const nodePoolPatchError = (error, nodePool) => ({
  type: types.NODEPOOL_PATCH_ERROR,
  error,
  nodePool,
});

export const nodePoolDelete = (clusterId, nodePool) => ({
  type: types.NODEPOOL_DELETE,
  clusterId,
  nodePool,
});

const nodePoolDeleteSuccess = (nodePoolId, clusterId) => ({
  type: types.NODEPOOL_DELETE_SUCCESS,
  nodePoolId,
  clusterId,
});

const nodePoolDeleteError = (nodePoolId, error) => ({
  type: types.NODEPOOL_DELETE_ERROR,
  nodePoolId,
  error,
});
