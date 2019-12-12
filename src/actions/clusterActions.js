import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { modalHide } from './modalActions';
import { nodePoolsLoad } from './nodePoolActions';
import { Providers } from 'shared/constants';
import { push } from 'connected-react-router';
import cmp from 'semver-compare';
import GiantSwarm from 'giantswarm';
import moment from 'moment';

// API instantiations.
const clustersApi = new GiantSwarm.ClustersApi();

// computeCapabilities takes a cluster object and provider and returns a
// capabilities object with the features that this cluster supports.
function computeCapabilities(cluster, provider) {
  let capabilities = {};
  let releaseVer = cluster.release_version;

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

// This is a helper function that transforms an array of clusters into an object of clusters
// with its ids as keys. Also we are adding some data to the cluters objects.
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
 * Performs the getClusters API call and dispatches related actions
 * This is just for getting all the clusters, but not their details.
 * @param {Boolean} withLoadingFlags Set to false to avoid loading state (eg when refreshing)
 */
export function clustersList({ withLoadingFlags }) {
  return async function(dispatch) {
    if (withLoadingFlags) dispatch({ type: types.CLUSTERS_LIST_REQUEST });

    // Fetch all clusters.
    return clustersApi
      .getClusters()
      .then(data => {
        const clusters = clustersLoadArrayToObject(data);

        const v5ClusterIds = data
          .filter(cluster => cluster.path.startsWith('/v5'))
          .map(cluster => cluster.id);

        dispatch({ type: types.CLUSTERS_LIST_SUCCESS, clusters, v5ClusterIds });
      })
      .catch(error => {
        console.error(error);
        dispatch({ type: types.CLUSTERS_LIST_ERROR, error });
      });
  };
}

/**
 * Performs getCluster API call to get the details of all clusters in store
 * @param {Boolean} filterBySelectedOrganization
 */
export function clustersDetails({
  filterBySelectedOrganization,
  withLoadingFlags,
}) {
  return async function(dispatch, getState) {
    if (withLoadingFlags) {
      dispatch({ type: types.CLUSTERS_DETAILS_REQUEST });
    }

    const selectedOrganization = getState().app.selectedOrganization;
    const allClusters = await getState().entities.clusters.items;

    const clusters = filterBySelectedOrganization
      ? Object.keys(allClusters).filter(
          id => allClusters[id].owner === selectedOrganization
        )
      : allClusters;

    const clusterDetails = await Promise.all(
      Object.keys(clusters).map(clusterId => {
        return dispatch(clusterLoadDetails(clusterId));
      })
    );

    // We actually don't care if success or error, just want to set loading flag to
    // false when all the promises are resolved/rejected.
    dispatch({ type: types.CLUSTERS_DETAILS_FINISHED });
    return clusterDetails; // just in case we want to await it
  };
}

/**
 * Loads details for a cluster.
 * @param {String} clusterId Cluster ID
 */
export function clusterLoadDetails(clusterId) {
  return async function(dispatch, getState) {
    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterId);

    dispatch({
      type: types.CLUSTER_LOAD_DETAILS,
      clusterId,
    });

    if (isV5Cluster) {
      dispatch({ type: types.V5_CLUSTER_LOAD_DETAILS });
    }

    try {
      const cluster = isV5Cluster
        ? await clustersApi.getClusterV5(clusterId)
        : await clustersApi.getCluster(clusterId);

      dispatch(clusterLoadStatus(clusterId)); // TODO

      cluster.capabilities = computeCapabilities(
        cluster,
        getState().app.info.general.provider
      );

      dispatch(clusterLoadDetailsSuccess(cluster));
      return cluster;
    } catch (error) {
      if (error.status === 404) {
        new FlashMessage(
          'This cluster no longer exists.',
          messageType.INFO,
          messageTTL.MEDIUM,
          'Redirecting you to your organization clusters list'
        );

        // Delete the cluster in te store.
        dispatch(clusterDeleteSuccess(clusterId));
        dispatch(push('/'));
      } else {
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
    }

    // Here we are chaining dispatches because we always want to get the node pools when
    // fetching cluster details.
    if (isV5Cluster) dispatch(nodePoolsLoad(clusterId));
  };
}

/**
 * Loads apps for a cluster.
 *
 * @param {String} clusterId Cluster ID
 */
export function clusterLoadApps(clusterId) {
  return function(dispatch, getState) {
    // This method is going to work for NP clusters, now in local dev it is not
    // working, so early return if the cluster is a NP one.
    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterId);
    if (isV5Cluster) {
      dispatch({
        type: types.CLUSTER_LOAD_APPS_SUCCESS,
        clusterId,
        apps: [],
      });
      return;
    }

    dispatch({
      type: types.CLUSTER_LOAD_APPS,
      clusterId,
    });

    var appsApi = new GiantSwarm.AppsApi();

    return appsApi
      .getClusterApps(clusterId)
      .then(apps => {
        // For some reason the array that we get back from the generated js client is an
        // array-like structure, so I make a new one here.
        // In tests we are using a real array, so we are applying Array.from() to an actual
        // array. Apparently it works fine.
        const appsArray = Array.from(apps);
        dispatch({
          type: types.CLUSTER_LOAD_APPS_SUCCESS,
          clusterId,
          apps: appsArray,
        });

        return apps;
      })
      .catch(error => {
        console.error('Error loading cluster apps:', error);
        dispatch({
          type: types.CLUSTER_LOAD_APPS_ERROR,
          clusterId,
          error,
        });

        new FlashMessage(
          'Something went wrong while trying to load apps installed on this cluster.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        throw error;
      });
  };
}

/**
 * Takes an app and a cluster id and tries to install it. Dispatches CLUSTER_INSTALL_APP_SUCCESS
 * on success or CLUSTER_INSTALL_APP_ERROR on error.
 *
 * If the app has valuesYAML set to a non empty object, then
 * this will first try to create the user config configmap
 * before creating the app, and it will make sure to fill in the
 * user_config configmap fields correctly when making the app.
 *
 * @param {Object} app App definition object.
 * @param {Object} clusterID Where to install the app.
 */
export function clusterInstallApp(app, clusterID) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_INSTALL_APP,
      clusterID,
      app,
    });

    var appsApi = new GiantSwarm.AppsApi();
    var appConfigsApi = new GiantSwarm.AppConfigsApi();

    var optionalCreateAppConfiguration = new Promise((resolve, reject) => {
      if (Object.keys(app.valuesYAML).length !== 0) {
        // If we have user config that we want to create, then
        // fire off the call to create it.
        appConfigsApi
          .createClusterAppConfig(clusterID, app.name, {
            body: app.valuesYAML,
          })
          .then(() => {
            // The call succeeded, resolve the promise
            resolve();
          })
          .catch(error => {
            if (error.status === 409) {
              new FlashMessage(
                `The ConfigMap for <code>${app.name}</code> already exists on cluster <code>${clusterID}</code>`,
                messageType.ERROR,
                messageTTL.LONG
              );
            } else if (error.status === 400) {
              new FlashMessage(
                `Your ConfigMap appears to be invalid. Please make sure all fields are filled in correctly.`,
                messageType.ERROR,
                messageTTL.LONG
              );
            } else {
              new FlashMessage(
                `Something went wrong while trying to create the ConfigMap. Please try again later or contact support: support@giantswarm.io`,
                messageType.ERROR,
                messageTTL.LONG
              );
            }

            reject(error);
          });
      } else {
        // Otherwise, no user config, so don't do anything.
        resolve({});
      }
    });

    return optionalCreateAppConfiguration
      .then(() => {
        return appsApi
          .createClusterApp(clusterID, app.name, {
            body: {
              spec: {
                catalog: app.catalog,
                name: app.chartName,
                namespace: app.namespace,
                version: app.version,
              },
            },
          })
          .catch(error => {
            if (error.status === 409) {
              new FlashMessage(
                `An app called <code>${app.name}</code> already exists on cluster <code>${clusterID}</code>`,
                messageType.ERROR,
                messageTTL.LONG
              );
            } else if (error.status === 400) {
              new FlashMessage(
                `Your input appears to be invalid. Please make sure all fields are filled in correctly.`,
                messageType.ERROR,
                messageTTL.LONG
              );
            } else {
              new FlashMessage(
                `Something went wrong while trying to install your app. Please try again later or contact support: support@giantswarm.io`,
                messageType.ERROR,
                messageTTL.LONG
              );
            }
            throw error;
          });
      })
      .then(() => {
        dispatch({
          type: types.CLUSTER_INSTALL_APP_SUCCESS,
          clusterID,
          app,
        });

        new FlashMessage(
          `Your app <code>${app.name}</code> is being installed on <code>${clusterID}</code>`,
          messageType.SUCCESS,
          messageTTL.MEDIUM
        );
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_INSTALL_APP_ERROR,
          clusterID,
          app,
          error,
        });

        throw error;
      });
  };
}

/**
 * Takes an app and a cluster id and tries to delete it. Dispatches CLUSTER_DELETE_APP_SUCCESS
 * on success or CLUSTER_DELETE_APP_ERROR on error.
 *
 * @param {Object} appName The name of the app
 * @param {Object} clusterID Where to delete the app.
 */
export function clusterDeleteApp(appName, clusterID) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_DELETE_APP,
      clusterID,
      appName,
    });

    var appsApi = new GiantSwarm.AppsApi();

    return appsApi
      .deleteClusterApp(clusterID, appName)
      .then(() => {
        new FlashMessage(
          `App <code>${appName}</code> will be deleted on <code>${clusterID}</code>`,
          messageType.SUCCESS,
          messageTTL.LONG
        );
      })
      .catch(error => {
        new FlashMessage(
          `Something went wrong while trying to delete your app. Please try again later or contact support: support@giantswarm.io`,
          messageType.ERROR,
          messageTTL.LONG
        );

        throw error;
      });
  };
}

/**
 * Takes a clusterId and loads status for that cluster.
 *
 * @param {String} clusterId Cluster ID
 */
export function clusterLoadStatus(clusterId) {
  return function(dispatch, getState) {
    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterId);

    if (isV5Cluster) {
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
      console.error(error);
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

        // throw error;
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
        if (location === undefined) {
          throw 'Did not get a location header back.';
        }

        const clusterId = location.split('/')[3];
        if (clusterId === undefined) {
          throw 'Did not get a valid cluster id.';
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

        return { clusterId, owner: cluster.owner };
      })
      .catch(error => {
        console.error(error);
        dispatch(clusterCreateError(cluster.id, error));
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
      .then(data => {
        dispatch(clusterDeleteSuccess(cluster.id));

        new FlashMessage(
          `Cluster <code>${cluster.id}</code> will be deleted`,
          messageType.INFO,
          messageTTL.SHORT
        );

        return data;
      })
      .catch(error => {
        new FlashMessage(
          `An error occurred when trying to delete cluster <code>${cluster.id}</code>.`,
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

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
    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterId);
    if (isV5Cluster) return Promise.resolve([]);

    var keypairsApi = new GiantSwarm.KeyPairsApi();

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

        console.error(error);
        throw error;
      });
  };
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

// v5Clusters is an array of clusters id
// const clustersLoadSuccess = (
//   v4ClustersObject,
//   v5ClustersObject,
//   v5Clusters,
//   lastUpdated
// ) => ({
//   type: types.CLUSTERS_LOAD_SUCCESS,
//   v4Clusters: v4ClustersObject,
//   v5Clusters: v5ClustersObject,
//   v5Clusters,
//   lastUpdated,
// });

export const clustersLoadError = error => ({
  type: types.CLUSTERS_LOAD_ERROR,
  error: error,
});

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

    var keypairsApi = new GiantSwarm.KeyPairsApi();
    return keypairsApi
      .addKeyPair(clusterId, keypair)
      .then(keypair => {
        dispatch({
          type: types.CLUSTER_CREATE_KEY_PAIR_SUCCESS,
          keypair,
        });

        return keypair;
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_CREATE_KEY_PAIR_ERROR,
          error,
        });

        console.error(error);
        throw error;
      });
  };
}
