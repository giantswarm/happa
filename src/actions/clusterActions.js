import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import GiantSwarm from 'giantswarm';
import { Providers } from 'shared/constants';
import cmp from 'semver-compare';
import { modalHide } from './modalActions';
import moment from 'moment';
import { nodePoolsLoad } from './nodePoolActions';
import { push } from 'connected-react-router';

// API instantiations.
const clustersApi = new GiantSwarm.ClustersApi();

// enhanceWithCapabilities enhances a list of clusters with the capabilities they support based on
// their release version and provider.
// ? Do we reaaly need this function?
function enhanceWithCapabilities(clusters, provider) {
  const newClusters = clusters.map(c => {
    c.capabilities = computeCapabilities(c, provider);

    return c;
  });

  return newClusters;
}

// computeCapabilities takes a cluster object and provider and returns a
// capabilities object with the features that this cluster supports.
function computeCapabilities(cluster, provider) {
  const capabilities = {};
  const releaseVer = cluster.release_version;

  // Installing Apps
  // Must be AWS or KVM and larger than 8.1.0
  // or any provider and larger than 8.2.0
  if (
    (cmp(releaseVer, '8.0.99') === 1 &&
      (provider === Providers.AWS || provider === Providers.KVM)) ||
    cmp(releaseVer, '8.1.99') === 1
  ) {
    capabilities.canInstallApps = true;
  }

  return capabilities;
}

export const clusterLoadDetailsSuccess = cluster => ({
  type: types.CLUSTER_LOAD_DETAILS_SUCCESS,
  cluster,
});

export const clusterLoadDetailsError = (clusterId, error) => ({
  type: types.CLUSTER_LOAD_DETAILS_ERROR,
  clusterId,
  error,
});

export const clusterLoadStatusSuccess = (clusterId, status) => ({
  type: types.CLUSTER_LOAD_STATUS_SUCCESS,
  clusterId,
  status,
});

export const clusterLoadStatusNotFound = clusterId => ({
  type: types.CLUSTER_LOAD_STATUS_NOT_FOUND,
  clusterId,
});

export const clusterLoadStatusError = error => ({
  type: types.CLUSTER_LOAD_STATUS_ERROR,
  error,
});

export const clusterCreateError = cluster => ({
  type: types.CLUSTER_CREATE_ERROR,
  cluster,
});

export const clusterDelete = cluster => ({
  type: types.CLUSTER_DELETE,
  cluster,
});

export const clusterDeleteSuccess = clusterId => ({
  type: types.CLUSTER_DELETE_SUCCESS,
  clusterId,
});

export const clusterDeleteError = (clusterId, error) => ({
  type: types.CLUSTER_DELETE_ERROR,
  clusterId,
  error,
});

export const clustersLoadError = error => ({
  type: types.CLUSTERS_LOAD_ERROR,
  error: error,
});

// nodePoolsClusters is an array of clusters id
export const clustersLoadSuccess = (
  v4ClustersObject,
  v5ClustersObject,
  nodePoolsClusters,
  lastUpdated
) => ({
  type: types.CLUSTERS_LOAD_SUCCESS,
  v4Clusters: v4ClustersObject,
  v5Clusters: v5ClustersObject,
  nodePoolsClusters,
  lastUpdated,
});

// This is a helper function, not an action creator.
// For some reason we are storing clusters as objects instead as arrays
function clustersLoadArrayToObject(clusters) {
  return clusters
    .map(cluster => {
      return {
        ...cluster,
        lastUpdated: Date.now(),
        nodes: cluster.nodes || [],
        keyPairs: cluster.keyPairs || [],
        scaling: cluster.scaling || {},
      };
    })
    .reduce((accumulator, current) => {
      return { ...accumulator, [current.id]: current };
    }, {});
}

/**
 * Performs the getClusters API call and dispatches the clustersLoadSuccess
 * action.
 */
export function clustersLoad() {
  return async function(dispatch, getState) {
    dispatch({ type: types.CLUSTERS_LOAD });

    // Fetch all clusters.
    const clusters = await clustersApi
      .getClusters()
      .then(clusterList => {
        // ? Do we really need to do this here? We are doing it after when fetching details.
        const enhancedClusters = enhanceWithCapabilities(
          clusterList,
          getState().app.info.general.provider
        );

        return enhancedClusters;
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);

        dispatch(clustersLoadError(error));
      });

    // Extract v4 clusters from the clusters fetched array.
    const v4Clusters = clusters.filter(cluster =>
      cluster.path.startsWith('/v4')
    );

    // TODO at some point we will probably have just one flow for all clusters.
    // Now we can't as we are not computing capabilities and not getting status
    // either for v5 clusters, so we fetch v5 clusters details in a separate method
    // at the end of this one.

    /********************** V4 CLUSTER DETAILS FETCHING **********************/

    // Clusters array to object, because we are storing an object in the store
    const v4ClustersObject = clustersLoadArrayToObject(v4Clusters);

    // Fetch all details for each cluster.
    const details = await Promise.all(
      Object.keys(v4ClustersObject).map(clusterId => {
        return clustersApi
          .getCluster(clusterId)
          .then(clusterDetails => {
            clusterDetails.capabilities = computeCapabilities(
              clusterDetails,
              getState().app.info.general.provider
            );

            return clusterDetails;
          })
          .catch(error => {
            // eslint-disable-next-line no-console
            console.error('Error loading cluster details:', error);

            dispatch(clusterLoadDetailsError(clusterId, error));
          });
      })
    );

    // And merge them with each cluster
    details.forEach(clusterDetail => {
      v4ClustersObject[clusterDetail.id] = {
        ...v4ClustersObject[clusterDetail.id],
        ...clusterDetail,
      };
    });

    // Fetch status for each cluster.
    const status = await Promise.all(
      Object.keys(v4ClustersObject).map(clusterId => {
        // TODO: Find out why we are getting an empty object back from this call.
        //Forcing us to use getClusterStatusWithHttpInfo instead of getClusterStatus
        return clustersApi
          .getClusterStatusWithHttpInfo(clusterId)
          .then(clusterStatus => {
            // For some reason we're getting an empty object back.
            // The Giantswarm JS client is not parsing the returned JSON
            // and giving us a object in the normal way anymore.
            // Very stumped, since nothing has changed.
            // So we need to access the raw response and parse the json
            // ourselves.
            const statusResponse = JSON.parse(clusterStatus.response.text);

            return { id: clusterId, statusResponse: statusResponse };
          })
          .catch(error => {
            // eslint-disable-next-line no-magic-numbers
            if (error.status === 404) {
              return { id: clusterId, statusResponse: null };
            }
            // eslint-disable-next-line no-console
            console.error(error);

            dispatch(clusterLoadStatusError(clusterId, error));
            throw error;
          });
      })
    );

    // And merge status with each cluster.
    status.forEach(clusterStatus => {
      v4ClustersObject[clusterStatus.id] = {
        ...v4ClustersObject[clusterStatus.id],
        ...{ status: clusterStatus.statusResponse },
      };
    });

    const lastUpdated = Date.now();

    /********************** V5 CLUSTER DETAILS FETCHING **********************/

    // Extract v5 clusters from the clusters fetched.
    const v5Clusters = clusters.filter(cluster =>
      cluster.path.startsWith('/v5')
    );

    // Get the details for v5 clusters.
    let v5ClustersDetails = await Promise.all(
      v5Clusters.map(cluster => clusterDetailsV5(dispatch, getState, cluster))
    );

    // Sometimes we fail to fetch a detail, and get undefined back.
    // So remove those from this list.
    v5ClustersDetails = v5ClustersDetails.filter(x => x);

    // Clusters array to object, because we are storing an object in the store.

    const v5ClustersObject = clustersLoadArrayToObject(v5ClustersDetails);

    // nodePoolsClusters is an array of v5 clusters ids and is stored in clusters.
    const nodePoolsClusters = v5ClustersDetails.map(cluster => cluster.id);

    dispatch(
      clustersLoadSuccess(
        v4ClustersObject,
        v5ClustersObject,
        nodePoolsClusters,
        lastUpdated
      )
    );

    // Once we have stored the Node Pools Clusters, let's fetch actual Node Pools.
    dispatch(nodePoolsLoad(nodePoolsClusters));
  };
}

function clusterDetailsV5(dispatch, getState, cluster) {
  return clustersApi
    .getClusterV5(cluster.id)
    .then(clusterDetails => {
      clusterDetails.capabilities = computeCapabilities(
        clusterDetails,
        getState().app.info.general.provider
      );

      return clusterDetails;
    })
    .catch(error => {
      // eslint-disable-next-line no-magic-numbers
      if (error.status === 404) {
        new FlashMessage(
          'This cluster no longer exists.',
          messageType.INFO,
          messageTTL.MEDIUM,
          'Redirecting you to your organization clusters list'
        );

        dispatch(clusterDeleteSuccess(cluster.id));
        dispatch(push('/'));
      } else {
        // eslint-disable-next-line no-console
        console.error('Error loading cluster details:', error);

        dispatch(clusterLoadDetailsError(cluster.id, error));
      }
    });
}

/**
 * Loads details for a cluster.
 *
 * @param {String} clusterId Cluster ID
 */
export function clusterLoadDetails(clusterId) {
  return async function(dispatch, getState) {
    const nodePoolsClusters = getState().entities.clusters.nodePoolsClusters;
    const isNodePoolsCluster = nodePoolsClusters.includes(clusterId);

    dispatch({
      type: types.CLUSTER_LOAD_DETAILS,
      clusterId,
    });

    if (isNodePoolsCluster) {
      dispatch({ type: types.V5_CLUSTER_LOAD_DETAILS });
    }

    try {
      const cluster = isNodePoolsCluster
        ? await clustersApi.getClusterV5(clusterId)
        : await clustersApi.getCluster(clusterId);

      dispatch(clusterLoadStatus(clusterId));

      cluster.capabilities = computeCapabilities(
        cluster,
        getState().app.info.general.provider
      );

      dispatch(clusterLoadDetailsSuccess(cluster));

      return cluster;
    } catch (error) {
      // eslint-disable-next-line no-magic-numbers
      if (error.status === 404) {
        new FlashMessage(
          'This cluster no longer exists.',
          messageType.INFO,
          messageTTL.MEDIUM,
          'Redirecting you to your organization clusters list'
        );

        dispatch(clusterDeleteSuccess(clusterId));
        dispatch(push('/'));

        return {};
      }

      // eslint-disable-next-line no-console
      console.error('Error loading cluster details:', error);
      dispatch(clusterLoadDetailsError(clusterId, error));

      new FlashMessage(
        'Something went wrong while trying to load cluster details.',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      throw error;
    }
  };
}

/**
 * Takes a clusterId and loads status for that cluster.
 *
 * @param {String} clusterId Cluster ID
 */
export function clusterLoadStatus(clusterId) {
  return function(dispatch, getState) {
    const nodePoolsClusters = getState().entities.clusters.nodePoolsClusters;
    const isNodePoolsCluster = nodePoolsClusters.includes(clusterId);

    if (isNodePoolsCluster) {
      // Here we will have something like clusterLoadStatusV5(...)?
      return;
    }
    clusterLoadStatusV4(dispatch, clusterId);
  };
}

function clusterLoadStatusV4(dispatch, clusterId) {
  dispatch({
    type: types.CLUSTER_LOAD_STATUS,
    clusterId,
  });

  // TODO: getClusterStatusWithHttpInfo usage copied from line 125. When it is fixed, also fix here
  return clustersApi
    .getClusterStatusWithHttpInfo(clusterId)
    .then(data => {
      return JSON.parse(data.response.text);
    })
    .then(status => {
      dispatch(clusterLoadStatusSuccess(clusterId, status));

      return status;
    })
    .catch(error => {
      // TODO: Find a better way to deal with status endpoint errors in dev:
      // https://github.com/giantswarm/giantswarm/issues/6757
      // eslint-disable-next-line no-magic-numbers
      if (error.status === 404) {
        dispatch(clusterLoadStatusNotFound(clusterId));
      } else {
        dispatch(clusterLoadStatusError(clusterId, error));

        new FlashMessage(
          'Something went wrong while trying to load the cluster status.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        throw error;
      }
    });
}

/**
 * Takes a cluster object and tries to create it. Dispatches CLUSTER_CREATE_SUCCESS
 * on success or CLUSTER_CREATE_ERROR on error.
 *
 * @param {Object} cluster Cluster definition object
 * @param {Boolean} isV5Cluster
 */
export function clusterCreate(cluster, isV5Cluster) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_CREATE,
    });

    const method = isV5Cluster
      ? 'addClusterV5WithHttpInfo'
      : 'addClusterWithHttpInfo';

    return clustersApi[method](cluster)
      .then(data => {
        const location = data.response.headers.location;
        if (typeof location === 'undefined') {
          throw new Error('Did not get a location header back.');
        }

        const clusterIdURLParamIndex = 3;
        const clusterId = location.split('/')[clusterIdURLParamIndex];
        if (typeof clusterId === 'undefined') {
          throw new Error('Did not get a valid cluster id.');
        }

        if (isV5Cluster) {
          dispatch({
            type: types.V5_CLUSTER_CREATE_SUCCESS,
            clusterId,
          });
        } else {
          dispatch({
            type: types.CLUSTER_CREATE_SUCCESS,
            clusterId,
          });
        }

        new FlashMessage(
          `Your new cluster with ID <code>${clusterId}</code> is being created.`,
          messageType.SUCCESS,
          messageTTL.MEDIUM
        );

        return dispatch(clusterLoadDetails(clusterId));
      })
      .catch(error => {
        dispatch(clusterCreateError(cluster.id, error));

        // eslint-disable-next-line no-console
        console.error(error);

        throw error;
      });
  };
}

/**
 * Takes a cluster object and deletes that cluster. Dispatches CLUSTER_DELETE_SUCCESS
 * on success or CLUSTER_DELETE_ERROR on error.
 *
 * @param {Object} cluster Cluster definition object, containing ID and owner
 */
export function clusterDeleteConfirmed(cluster) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_DELETE_CONFIRMED,
      cluster,
    });

    return clustersApi
      .deleteCluster(cluster.id)
      .then(() => {
        dispatch(push(`/organizations/${cluster.owner}`));
        dispatch(clusterDeleteSuccess(cluster.id));

        dispatch(modalHide());

        new FlashMessage(
          `Cluster <code>${cluster.id}</code> will be deleted`,
          messageType.INFO,
          messageTTL.SHORT
        );

        // ensure refreshing of the clusters list
        dispatch(clustersLoad());
      })
      .catch(error => {
        dispatch(modalHide());

        new FlashMessage(
          `An error occurred when trying to delete cluster <code>${cluster.id}</code>.`,
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        // eslint-disable-next-line no-console
        console.error(error);

        return dispatch(clusterDeleteError(cluster.id, error));
      });
  };
}

/**
 * Takes a clusterId and loads its key pairs.
 * dispatches CLUSTER_LOAD_KEY_PAIRS_SUCCESS on success or CLUSTER_LOAD_KEY_PAIRS_ERROR
 * on error.
 *
 * @param {String} clusterId Cluster ID
 */
export function clusterLoadKeyPairs(clusterId) {
  return function(dispatch, getState) {
    // This method is going to work for NP clusters, now in local dev it is not
    // working, so early return if the cluster is a NP one.
    const nodePoolsClusters = getState().entities.clusters.nodePoolsClusters;
    const isNodePoolsCluster = nodePoolsClusters.includes(clusterId);
    if (isNodePoolsCluster) return Promise.resolve([]);

    const keypairsApi = new GiantSwarm.KeyPairsApi();

    dispatch({
      type: types.CLUSTER_LOAD_KEY_PAIRS,
      clusterId,
    });

    return keypairsApi
      .getKeyPairs(clusterId)
      .then(keyPairs => {
        // Add expire_date to keyPairs based on ttl_hours
        const keyPairsWithDates = Object.entries(keyPairs).map(
          ([, keyPair]) => {
            keyPair.expire_date = moment(keyPair.create_date)
              .utc()
              .add(keyPair.ttl_hours, 'hours');

            return keyPair;
          }
        );

        dispatch({
          type: types.CLUSTER_LOAD_KEY_PAIRS_SUCCESS,
          clusterId,
          keyPairs: keyPairsWithDates,
        });
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_LOAD_KEY_PAIRS_ERROR,
          clusterId,
        });

        // eslint-disable-next-line no-console
        console.error(error);

        throw error;
      });
  };
}

/**
 * Takes a cluster object and tries to patch it.
 * Dispatches CLUSTER_PATCH on patch and CLUSTER_PATCH_ERROR
 * on error.
 *
 * @param {Object} cluster Cluster object
 * @param {Object} payload object with just the data we want to modify
 */
export function clusterPatch(cluster, payload, isNodePoolCluster) {
  return function(dispatch) {
    // Optimistic update.
    dispatch({
      type: types.CLUSTER_PATCH,
      cluster,
      payload,
    });

    const modifyCluster = isNodePoolCluster
      ? clustersApi.modifyClusterV5(cluster.id, payload)
      : clustersApi.modifyCluster(cluster.id, payload);

    return modifyCluster.catch(error => {
      // Undo update to store if the API call fails.
      dispatch({
        type: types.CLUSTER_PATCH_ERROR,
        error,
        cluster,
      });

      new FlashMessage(
        'Something went wrong while trying to update the cluster',
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
 * Creates a keypair for a cluster.
 * Dispatches CLUSTER_CREATE_KEYPAIR_SUCCESS on success or CLUSTER_CREATE_KEYPAIR_ERROR
 * on error.
 *
 * @param {String} clusterId Cluster ID
 * @param {Object} keypair   Key pair object
 */
export function clusterCreateKeyPair(clusterId, keypair) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_CREATE_KEY_PAIR,
      keypair,
    });

    const keypairsApi = new GiantSwarm.KeyPairsApi();

    return keypairsApi
      .addKeyPair(clusterId, keypair)
      .then(pair => {
        dispatch({
          type: types.CLUSTER_CREATE_KEY_PAIR_SUCCESS,
          pair,
        });

        return pair;
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_CREATE_KEY_PAIR_ERROR,
          error,
        });

        // eslint-disable-next-line no-console
        console.error(error);

        throw error;
      });
  };
}
