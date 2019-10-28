import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { modalHide } from './modalActions';
import GiantSwarm from 'giantswarm';

// API instantiations.
const nodePoolsApi = new GiantSwarm.NodepoolsApi();

//Loads all node pools for all node pools clusters.
export function nodePoolsLoad() {
  return async function(dispatch, getState) {
    const nodePoolsClustersId =
      getState().entities.clusters.nodePoolsClusters || [];

    return Promise.all(
      nodePoolsClustersId.map(async clusterId => {
        const nodePools = await nodePoolsApi.getNodePools(clusterId);

        // Receiving an array-like with weird prototype from API call,
        // so converting it to an array.
        let nodePoolsArray = (Array.from(nodePools) || []).map(np => np.id);

        // Dispatch action for populating nodePools key inside cluster
        dispatch(clusterNodePoolsLoadSucces(clusterId, nodePoolsArray));

        return nodePools;
      })
    )
      .then(nodePools => {
        const allNodePools = Array.from(nodePools)
          .flat()
          .reduce((accumulator, np) => {
            return { ...accumulator, [np.id]: np };
          }, {});

        dispatch(nodePoolsLoadSucces(allNodePools));
      })
      .catch(error => {
        if (error.status === 404) {
          dispatch(nodePoolsLoadSucces({}));
          return;
        }

        console.error('Error loading cluster node pools:', error);
        dispatch(nodePoolsLoadError(error));

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
      .modifyNodePool(clusterId, nodePool, payload)
      .catch(error => {
        // Undo update to store if the API call fails.
        dispatch(nodePoolPatchError(error, nodePool));

        new FlashMessage(
          'Something went wrong while trying to update the node pool name',
          messageType.ERROR,
          messageTTL.MEDIUM,
          'Please try again later or contact support: support@giantswarm.io'
        );

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

    // TODO optimistical update
    return nodePoolsApi
      .deleteNodePool(clusterId, nodePool.id)
      .then(() => {
        dispatch(nodePoolDeleteSuccess(clusterId, nodePool.id));

        dispatch(modalHide());

        new FlashMessage(
          'Node Pool <code>' + nodePool.id + '</code> will be deleted',
          messageType.INFO,
          messageTTL.SHORT
        );

        // ensure refreshing of the node pools list. Needed?
        // dispatch(clustersLoad());
      })
      .catch(error => {
        dispatch(modalHide());

        new FlashMessage(
          'An error occurred when trying to delete node pool <code>' +
            nodePool.id +
            '</code>.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        console.error(error);
        return dispatch(nodePoolDeleteError(nodePool.id, error));
      });
  };
}

/**
 * Takes a node pool object and tries to create it. Dispatches NODEPOOL_CREATE_SUCCESS
 * on success or NODEPOOL_CREATE_ERROR on error.
 *
 * @param {Object} nodepool Node Pool definition object
 */
export function nodePoolsCreate(clusterId, nodePools) {
  // console.log(clusterId, JSON.stringify(nodePool));
  // return;

  return async function(dispatch) {
    nodePools.forEach(nodePool => {
      return nodePoolsApi
        .addNodePool(clusterId, nodePool)
        .then(nodePool => {
          new FlashMessage(
            `Your new node pool with ID <code>${nodePool.id}</code> is being created.`,
            messageType.SUCCESS,
            messageTTL.MEDIUM
          );

          dispatch({
            type: types.NODEPOOL_CREATE_SUCCESS,
            clusterId,
            nodePool,
          });
        })
        .catch(error => {
          dispatch({
            type: types.NODEPOOL_CREATE_ERROR,
            error,
          });

          new FlashMessage(
            'Something went wrong while trying to create the node pool',
            messageType.ERROR,
            messageTTL.MEDIUM,
            'Please try again later or contact support: support@giantswarm.io'
          );

          console.error(error);
          throw error;
        });
    });
  };
}

// Actions
const clusterNodePoolsLoadSucces = (clusterId, nodePools) => ({
  type: types.CLUSTERS_LOAD_NODEPOOLS_SUCCESS,
  clusterId,
  nodePools: nodePools,
});

const nodePoolsLoadSucces = (nodePools = {}) => ({
  type: types.NODEPOOLS_LOAD_SUCCESS,
  nodePools,
});

const nodePoolsLoadError = error => ({
  type: types.NODEPOOLS_LOAD_ERROR,
  error,
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

const nodePoolDeleteSuccess = nodePoolId => ({
  type: types.NODEPOOL_DELETE_SUCCESS,
  nodePoolId,
});

const nodePoolDeleteError = (nodePoolId, error) => ({
  type: types.NODEPOOL_DELETE_ERROR,
  nodePoolId,
  error,
});
