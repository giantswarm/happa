import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { modalHide } from './modalActions';
import { push } from 'connected-react-router';
import APIClusterStatusClient from 'lib/api_status_client';
import cmp from 'semver-compare';
import GiantSwarm from 'giantswarm';

// API instantiations
const clustersApi = new GiantSwarm.ClustersApi();

// enhanceWithCapabilities enhances a list of clusters with the capabilities they support based on
// their release version and provider.
function enhanceWithCapabilities(clusters, provider) {
  clusters = clusters.map(c => {
    c.capabilities = computeCapabilities(c, provider);
    return c;
  });

  return clusters;
}

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
      (provider === 'aws' || provider === 'kvm')) ||
    cmp(releaseVer, '8.1.99') === 1
  ) {
    capabilities.canInstallApps = true;
  }

  return capabilities;
}

/**
 * Performs the getClusters API call and dispatches the clustersLoadSuccess
 * action.
 */
export function clustersLoad() {
  return function(dispatch, getState) {
    const token = getState().app.loggedInUser.auth.token;
    const scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({ type: types.CLUSTERS_LOAD });

    // TODO getClusters() will get all clusters, so we will need some logic here
    // that separates regular clusters from NP clusters and then pass them to their
    // respective methods.

    const regularClusters = clustersLoadV4(token, scheme, dispatch);
    const nodePoolsClusters =
      window.config.environment === 'development'
        ? clustersLoadV5(token, scheme, dispatch)
        : [];

    Promise.all([regularClusters, nodePoolsClusters])
      .then(([regularClusters, nodePoolClusters]) => {
        const clusters = enhanceWithCapabilities(
          [...regularClusters, ...nodePoolClusters],
          getState().app.info.general.provider
        );

        dispatch(clustersLoadSuccess(clusters));
        return clusters;
      })
      .catch(error => {
        console.error(error);
        dispatch(clustersLoadError(error));
      });
  };
}

export function clustersLoadV4(token, scheme, dispatch) {
  dispatch({ type: types.CLUSTERS_LOAD_V4 });

  // TODO this will be in getClusters() here in this function we just want to
  // dispatch specific actions for v4 clusters.
  // Or maybe we won't need this method at all.
  return clustersApi
    .getClusters(scheme + ' ' + token)
    .then(clusters => clusters)
    .catch(error => {
      console.error(error);
      dispatch(clustersLoadErrorV4(error));
    });
}

export function clustersLoadV5(token, scheme, dispatch) {
  dispatch({ type: types.CLUSTERS_LOAD_V5 });

  // TODO this will be in getClusters() here in this function we just want to
  // dispatch specific actions for v5 clusters.
  // Or maybe we won't need this method at all.
  return clustersApi
    .getClusterV5(scheme + ' ' + token, 'm0ckd')
    .then(clusters => {
      const clusterIds = [clusters].map(cluster => cluster.id);

      dispatch(clustersLoadSuccessV5(clusterIds));
      return [clusters];
    })
    .catch(error => {
      console.error(error);
      dispatch(clustersLoadErrorV5(error));
    });
}

/**
 * Loads apps for a cluster.
 *
 * @param {String} clusterId Cluster ID
 */
export function clusterLoadApps(clusterId) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_LOAD_APPS,
      clusterId,
    });

    var appsApi = new GiantSwarm.AppsApi();

    return appsApi
      .getClusterApps(scheme + ' ' + token, clusterId)
      .then(apps => {
        dispatch({
          type: types.CLUSTER_LOAD_APPS_SUCCESS,
          clusterId,
          apps,
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
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

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
          .createClusterAppConfig(scheme + ' ' + token, clusterID, app.name, {
            body: app.valuesYAML,
          })
          .then(() => {
            // The call succeeded, resolve the promise
            resolve();
          })
          .catch(error => {
            if (error.status === 409) {
              new FlashMessage(
                `The user configuration ConfigMap for <code>${app.name}</code> already exists on cluster <code>${clusterID}</code>`,
                messageType.ERROR,
                messageTTL.LONG
              );
            } else if (error.status === 400) {
              new FlashMessage(
                `Your user configuration ConfigMap appears to be invalid. Please make sure all fields are filled in correctly.`,
                messageType.ERROR,
                messageTTL.LONG
              );
            } else {
              new FlashMessage(
                `Something went wrong while trying to create the user configuration ConfigMap. Please try again later or contact support: support@giantswarm.io`,
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
          .createClusterApp(scheme + ' ' + token, clusterID, app.name, {
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
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_DELETE_APP,
      clusterID,
      appName,
    });

    var appsApi = new GiantSwarm.AppsApi();

    return appsApi
      .deleteClusterApp(scheme + ' ' + token, clusterID, appName)
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
 * Loads details for a cluster.
 *
 * @param {String} clusterId Cluster ID
 */
export function clusterLoadDetails(clusterId) {
  return async function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;
    const nodePoolsClusters = getState().entities.clusters.nodePoolsClusters;

    dispatch({
      type: types.CLUSTER_LOAD_DETAILS,
      clusterId,
    });

    const isNodePoolCluster = nodePoolsClusters.includes(clusterId);

    try {
      const cluster = isNodePoolCluster
        ? await clustersApi.getClusterV5(scheme + ' ' + token, clusterId)
        : await clustersApi.getCluster(scheme + ' ' + token, clusterId);
      dispatch(clusterLoadStatus(clusterId));

      cluster.capabilities = computeCapabilities(
        cluster,
        getState().app.info.general.provider
      );

      dispatch(clusterLoadDetailsSuccess(cluster));
      return cluster;
    } catch (error) {
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
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_LOAD_STATUS,
      clusterId,
    });

    var apiClusterStatus = new APIClusterStatusClient({
      endpoint: window.config.apiEndpoint,
    });

    return apiClusterStatus
      .getClusterStatus(scheme + ' ' + token, clusterId)
      .then(status => {
        dispatch(clusterLoadStatusSuccess(clusterId, status));
        return status;
      })
      .catch(error => {
        console.error(error);
        if (error.status === 404) {
          dispatch(clusterLoadStatusNotFound(clusterId));
        } else if (clusterId === 'm0ckd') {
          // TODO Delete it when this doesn't trigger an error. This is just for
          // avoiding annoying flash messages.
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
  };
}

/**
 * Takes a cluster object and tries to create it. Dispatches CLUSTER_CREATE_SUCCESS
 * on success or CLUSTER_CREATE_ERROR on error.
 *
 * @param {Object} cluster Cluster definition object
 */
export function clusterCreate(cluster) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_CREATE,
      cluster,
    });

    var clustersApi = new GiantSwarm.ClustersApi();

    return clustersApi
      .addClusterWithHttpInfo(scheme + ' ' + token, cluster)
      .then(data => {
        var location = data.response.headers.location;
        if (location === undefined) {
          throw 'Did not get a location header back.';
        }

        var clusterId = location.split('/')[3];
        if (clusterId === undefined) {
          throw 'Did not get a valid cluster id.';
        }

        dispatch(clusterCreateSuccess(clusterId));

        new FlashMessage(
          'Your new cluster with ID <code>' +
            clusterId +
            '</code> is being created.',
          messageType.SUCCESS,
          messageTTL.MEDIUM
        );

        return dispatch(clusterLoadDetails(clusterId));
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
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_DELETE_CONFIRMED,
      cluster,
    });

    var clustersApi = new GiantSwarm.ClustersApi();

    return clustersApi
      .deleteCluster(scheme + ' ' + token, cluster.id)
      .then(() => {
        dispatch(push('/organizations/' + cluster.owner));
        dispatch(clusterDeleteSuccess(cluster.id));

        dispatch(modalHide());

        new FlashMessage(
          'Cluster <code>' + cluster.id + '</code> will be deleted',
          messageType.INFO,
          messageTTL.SHORT
        );

        // ensure refreshing of the clusters list
        dispatch(clustersLoad());
      })
      .catch(error => {
        dispatch(modalHide());

        new FlashMessage(
          'An error occurred when trying to delete cluster <code>' +
            cluster.id +
            '</code>.',
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
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;
    var keypairsApi = new GiantSwarm.KeyPairsApi();

    dispatch({
      type: types.CLUSTER_LOAD_KEY_PAIRS,
      clusterId,
    });

    return keypairsApi
      .getKeyPairs(scheme + ' ' + token, clusterId)
      .then(keyPairs => {
        dispatch({
          type: types.CLUSTER_LOAD_KEY_PAIRS_SUCCESS,
          clusterId,
          keyPairs: keyPairs,
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

export function clusterLoadDetailsSuccess(cluster) {
  return {
    type: types.CLUSTER_LOAD_DETAILS_SUCCESS,
    cluster,
  };
}

export function clusterLoadDetailsError(error) {
  return {
    type: types.CLUSTER_LOAD_DETAILS_ERROR,
    error,
  };
}

export function clusterLoadStatusSuccess(clusterId, status) {
  return {
    type: types.CLUSTER_LOAD_STATUS_SUCCESS,
    clusterId,
    status,
  };
}

export function clusterLoadStatusNotFound(clusterId) {
  return {
    type: types.CLUSTER_LOAD_STATUS_NOT_FOUND,
    clusterId,
  };
}

export function clusterLoadStatusError(error) {
  return {
    type: types.CLUSTER_LOAD_STATUS_ERROR,
    error,
  };
}

export function clusterCreateSuccess(cluster) {
  return {
    type: types.CLUSTER_CREATE_SUCCESS,
    cluster,
  };
}

export function clusterCreateError(cluster) {
  return {
    type: types.CLUSTER_CREATE_ERROR,
    cluster,
  };
}

export function clusterDelete(cluster) {
  return {
    type: types.CLUSTER_DELETE,
    cluster,
  };
}

export function clusterDeleteSuccess(clusterId) {
  return {
    type: types.CLUSTER_DELETE_SUCCESS,
    clusterId,
  };
}

export function clusterDeleteError(clusterId, error) {
  return {
    type: types.CLUSTER_DELETE_ERROR,
    clusterId,
    error,
  };
}

export function clustersLoadSuccess(clusters) {
  return {
    type: types.CLUSTERS_LOAD_SUCCESS,
    clusters: clusters,
  };
}

export function clustersLoadSuccessV5(nodePoolsClusters) {
  return {
    type: types.CLUSTERS_LOAD_SUCCESS_V5,
    nodePoolsClusters,
  };
}

export function clustersLoadError(error) {
  return {
    type: types.CLUSTERS_LOAD_ERROR,
    error: error,
  };
}

export function clustersLoadErrorV4(error) {
  return {
    type: types.CLUSTERS_LOAD_ERROR_V4,
    error: error,
  };
}

export function clustersLoadErrorV5(error) {
  return {
    type: types.CLUSTERS_LOAD_ERROR_V5,
    error: error,
  };
}

/**
 * Takes a cluster object and tries to patch it.
 * Dispatches CLUSTER_PATCH_SUCCESS on success or CLUSTER_PATCH_ERROR
 * on error.
 *
 * @param {Object} cluster Cluster modification object
 */
export function clusterPatch(cluster) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_PATCH,
      cluster,
    });

    var clusterId = cluster.id;
    delete cluster.id;

    var clustersApi = new GiantSwarm.ClustersApi();
    return clustersApi
      .modifyCluster(scheme + ' ' + token, cluster, clusterId)
      .then(cluster => {
        dispatch({
          type: types.CLUSTER_PATCH_SUCCESS,
          cluster,
        });

        return cluster;
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_PATCH_ERROR,
          error,
        });

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
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_CREATE_KEY_PAIR,
      keypair,
    });

    var keypairsApi = new GiantSwarm.KeyPairsApi();
    return keypairsApi
      .addKeyPair(scheme + ' ' + token, clusterId, keypair)
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
