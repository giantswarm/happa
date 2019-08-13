import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import GiantSwarm from 'giantswarm';

// API instantiations.
const nodePoolsApi = new GiantSwarm.NodepoolsApi();

/**
 * Loads all node pools for all node pools clusters.
 *
 * @param {String} clusterId Cluster ID
 */
export function nodePoolsLoad() {
  return async function(dispatch, getState) {
    const token = getState().app.loggedInUser.auth.token;
    const scheme = getState().app.loggedInUser.auth.scheme;
    const clusters = getState().entities.clusters.nodePoolsClusters || [];

    return Promise.all(
      clusters.map(async clusterId => {
        const nodePools = await nodePoolsApi.getNodePools(
          scheme + ' ' + token,
          clusterId
        );

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
 * Takes a nodePool object and tries to patch it.
 * Dispatches NODEPOOL_PATCH on patch and NODEPOOL_PATCH_ERROR
 * on error.
 *
 * @param {Object} cluster Cluster modification object
 */
export function nodePoolPatch(nodePool, payload) {
  return function(dispatch, getState) {
    const token = getState().app.loggedInUser.auth.token;
    const scheme = getState().app.loggedInUser.auth.scheme;

    // This is to get the cluster id.
    const clusters = getState().entities.clusters.items;
    const nodePoolsClusters = getState().entities.clusters.nodePoolsClusters;

    const cluster = nodePoolsClusters
      .map(nodePoolCluster => {
        return {
          id: nodePoolCluster,
          nodePools: clusters[nodePoolCluster].nodePools,
        };
      })
      .filter(cluster => cluster.nodePools.some(np => np === nodePool.id));

    const clusterId = cluster[0].id;

    // Optimistic update.
    dispatch(nodePoolPatchAction(nodePool, payload));

    return nodePoolsApi
      .modifyNodePool(scheme + ' ' + token, clusterId, nodePool, payload)
      .then(() => {
        new FlashMessage(
          'Node pool name changed',
          messageType.SUCCESS,
          messageTTL.SHORT
        );
      })
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
