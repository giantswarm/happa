import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { StatusCodes } from 'shared/constants';

import * as types from './actionTypes';
import { modalHide } from './modalActions';

// API instantiations.
const nodePoolsApi = new GiantSwarm.NodePoolsApi();

// Loads one cluster node pools
export function clusterNodePoolsLoad(clusterId, { withLoadingFlags }) {
  return function (dispatch) {
    if (withLoadingFlags) {
      dispatch({ type: types.CLUSTER_NODEPOOLS_LOAD_REQUEST, id: clusterId });
    }

    return (
      nodePoolsApi
        .getNodePools(clusterId)
        .then((data) => {
          // Receiving an array-like with weird prototype from API call,
          // so converting it to an array.
          const nodePoolsArray = Array.from(data) || [];

          // Dispatch action for populating nodePools key inside cluster
          dispatch({
            type: types.CLUSTER_NODEPOOLS_LOAD_SUCCESS,
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
              type: types.CLUSTER_NODEPOOLS_LOAD_ERROR,
              id: clusterId,
              error: 'Node pools not found',
            });

            return;
          }

          dispatch({
            type: types.CLUSTER_NODEPOOLS_LOAD_ERROR,
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

// Loads all node pools for all v5 clusters in store.
export function nodePoolsLoad({
  filterBySelectedOrganization,
  withLoadingFlags,
}) {
  return async function (dispatch, getState) {
    if (withLoadingFlags) dispatch({ type: types.NODEPOOLS_LOAD_REQUEST });

    const selectedOrganization = getState().main.selectedOrganization;
    const allClusters = getState().entities.clusters.items;
    const v5ClustersId = getState().entities.clusters.v5Clusters || [];

    // Remove deleted clusters from clusters array
    const v5ActiveClustersIds = v5ClustersId.filter(
      (id) => !allClusters[id].delete_date
    );

    const filteredClusters = filterBySelectedOrganization
      ? v5ActiveClustersIds.filter(
          (id) => allClusters[id].owner === selectedOrganization
        )
      : v5ActiveClustersIds;

    if (filteredClusters.length > 0) {
      await Promise.all(
        filteredClusters.map((clusterId) =>
          dispatch(clusterNodePoolsLoad(clusterId, { withLoadingFlags: true }))
        )
      );
    }

    if (withLoadingFlags) dispatch({ type: types.NODEPOOLS_LOAD_FINISHED });
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
  return function (dispatch) {
    dispatch({
      type: types.NODEPOOL_PATCH,
      nodePool,
      payload,
    });

    return nodePoolsApi
      .modifyNodePool(clusterId, nodePool.id, payload)
      .catch((error) => {
        // Undo update to store if the API call fails.
        dispatch({
          type: types.NODEPOOL_PATCH_ERROR,
          error,
          nodePool,
        });

        new FlashMessage(
          'Something went wrong while trying to update the node pool name',
          messageType.ERROR,
          messageTTL.MEDIUM,
          'Please try again later or contact support: support@giantswarm.io'
        );

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
  return function (dispatch) {
    dispatch({
      type: types.NODEPOOL_DELETE_CONFIRMED_REQUEST,
      clusterId,
      nodePool,
    });

    return nodePoolsApi
      .deleteNodePool(clusterId, nodePool.id)
      .then(() => {
        dispatch({
          type: types.NODEPOOL_DELETE_SUCCESS,
          nodePoolId: nodePool.id,
          clusterId,
        });

        dispatch(modalHide());

        new FlashMessage(
          `Node Pool <code>${nodePool.id}</code> will be deleted`,
          messageType.INFO,
          messageTTL.SHORT
        );
      })
      .catch((error) => {
        dispatch(modalHide());

        new FlashMessage(
          `An error occurred when trying to delete node pool <code>${nodePool.id}</code>.`,
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        return dispatch({
          type: types.NODEPOOL_DELETE_ERROR,
          nodePoolId: nodePool.id,
          error,
        });
      });
  };
}

/**
 * Takes an array of node pool objects and tries to create each one.
 * This way we have a unique function that can be used in v5 cluster creation form and when
 * adding multiple node pools from the v5 cluster details view
 * Dispatches NODEPOOL_CREATE_SUCCESS on success or NODEPOOL_CREATE_ERROR on error.
 *
 * @param {string} clusterId - The ID of the cluster
 * @param {Array} nodePools - Array of Node Pool definition objects
 * @param {Object} [opts] - Optional parameters
 * @param {boolean} [opts.withFlashMessages] - If the action should show flash messages after execution
 */
export function nodePoolsCreate(clusterId, nodePools, opts) {
  return async function (dispatch) {
    dispatch({ type: types.NODEPOOLS_CREATE_REQUEST });

    const allNodePools = await Promise.all(
      nodePools.map((nodePool) => {
        return nodePoolsApi
          .addNodePool(clusterId, nodePool)
          .then((newNodePool) => {
            dispatch({ type: types.NODEPOOL_CREATE_REQUEST });

            // When created, there is no status in the response
            const nodePoolWithStatus = {
              ...newNodePool,
              status: { nodes_ready: 0, nodes: 0 },
            };

            dispatch({
              type: types.NODEPOOL_CREATE_SUCCESS,
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
              type: types.NODEPOOL_CREATE_ERROR,
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

    dispatch({ type: types.NODEPOOLS_CREATE_FINISHED });

    return allNodePools;
  };
}

// Action creators.
export const nodePoolDelete = (clusterId, nodePool) => ({
  type: types.NODEPOOL_DELETE,
  clusterId,
  nodePool,
});
