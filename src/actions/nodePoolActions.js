import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import GiantSwarm from 'giantswarm';
import { modalHide } from './modalActions';

// API instantiations.
const nodePoolsApi = new GiantSwarm.NodePoolsApi();

// Actions
const clusterNodePoolsLoadSuccess = (clusterId, nodePools) => ({
  type: types.CLUSTERS_LOAD_NODEPOOLS_SUCCESS,
  clusterId,
  nodePools: nodePools,
});

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

//Loads all node pools for all node pools clusters.
export function nodePoolsLoad() {
  return function(dispatch, getState) {
    dispatch({
      type: types.NODEPOOLS_LOAD,
      isFetching: true,
    });

    const nodePoolsClustersId =
      getState().entities.clusters.nodePoolsClusters || [];

    return Promise.all(
      nodePoolsClustersId.map(async clusterId => {
        const nodePools = await nodePoolsApi.getNodePools(clusterId);

        // Receiving an array-like with weird prototype from API call,
        // so converting it to an array.
        const nodePoolsArray = (Array.from(nodePools) || []).map(np => np.id);

        // Dispatch action for populating nodePools key inside cluster
        dispatch(clusterNodePoolsLoadSuccess(clusterId, nodePoolsArray));

        return nodePools;
      })
    )
      .then(nodePools => {
        const allNodePools = Array.from(nodePools)
          .flat()
          .reduce((accumulator, np) => {
            return { ...accumulator, [np.id]: np };
          }, {});

        dispatch({
          type: types.NODEPOOLS_LOAD_SUCCESS,
          nodePools: allNodePools,
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Error loading cluster node pools:', error);

        dispatch({
          type: types.NODEPOOLS_LOAD_ERROR,
          error,
        });

        new FlashMessage(
          'Something went wrong while trying to load node pools on this cluster.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        throw error;
      });
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
    dispatch(nodePoolPatchAction(nodePool, payload));

    return nodePoolsApi
      .modifyNodePool(clusterId, nodePool.id, payload)
      .catch(error => {
        // Undo update to store if the API call fails.
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
          .then(pool => {
            // When created no status in the response
            const nodePoolWithStatus = {
              ...pool,
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
    dispatch(nodePoolsLoad());

    return allNodePools;
  };
}
