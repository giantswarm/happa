import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { modalHide } from './modalActions';
import { nodePoolsLoad } from './nodePoolsActions';
import { push } from 'connected-react-router';
import cmp from 'semver-compare';
import GiantSwarm from 'giantswarm';
import mockedStatus from 'mockedStatus';
import moment from 'moment';

// API instantiations.
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
    // Fetch all clusters.
    const clusters = await clustersApi
      .getClusters()
      .then(clusters => {
        const enhancedClusters = enhanceWithCapabilities(
          clusters,
          getState().app.info.general.provider
        );

        return enhancedClusters;
      })
      .catch(error => {
        console.error(error);
        dispatch(clustersLoadErrorV4(error));
      });

    // Extract v4 clusters from the clusters fetched array.
    const v4Clusters = clusters.filter(cluster =>
      cluster.path.startsWith('/v4')
    );

    // TODO at some point we will probably have just one flow for all clusters.
    // Now we are not computing capabilities and not getting status either for
    // v5 clusters, so we fetch v5 clusters details in a separate method at the
    // end of this one.

    /********************** V4 CLUSTER DETAILS FETCHING **********************/

    // Clusters array to object, because we are storing an object in the store
    let v4ClustersObject = clustersLoadArrayToObject(v4Clusters);

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
        if (window.config.environment === 'development') {
          return { id: clusterId, ...mockedStatus };
        } else {
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
              let statusResponse = JSON.parse(clusterStatus.response.text);
              return { id: clusterId, statusResponse: statusResponse };
            })
            .catch(error => {
              if (error.status === 404) {
                return { id: clusterId, statusResponse: null };
              } else {
                console.error(error);
                dispatch(clusterLoadStatusError(clusterId, error));
                throw error;
              }
            });
        }
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
    dispatch(clustersLoadSuccessV4(v4ClustersObject, lastUpdated));

    /********************** V5 CLUSTER DETAILS FETCHING **********************/

    // Extract v5 clusters from the clusters fetched.
    const v5Clusters = Array.from(clusters).filter(cluster =>
      cluster.path.startsWith('/v5')
    );

    // Get the details for v5 clusters.
    if (window.config.environment === 'development') {
      const clusters = await Promise.all(
        v5Clusters.map(cluster => clusterDetailsV5(dispatch, cluster))
      );

      // Clusters array to object, because we are storing an object in the store
      let v5ClustersObject = clustersLoadArrayToObject(clusters);

      // nodePoolsClusters is an array of NP clusters ids and will be stored in items.
      const nodePoolsClusters = clusters.map(cluster => cluster.id);
      const lastUpdated = Date.now();
      dispatch(
        clustersLoadSuccessV5(v5ClustersObject, nodePoolsClusters, lastUpdated)
      );

      // Once we have stored the Node Pools Clusters, let's fetch actual Node Pools.
      dispatch(nodePoolsLoad(nodePoolsClusters));
    }
  };
}

function clusterDetailsV5(dispatch, cluster) {
  return clustersApi
    .getClusterV5(cluster.id)
    .then(clusterDetails => {
      return clusterDetails;
    })
    .catch(error => {
      console.error('Error loading cluster details:', error);
      dispatch(clusterLoadDetailsError(cluster.id, error));
    });
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
    const nodePoolsClusters = getState().entities.clusters.nodePoolsClusters;
    const isNodePoolsCluster = nodePoolsClusters.includes(clusterId);
    if (isNodePoolsCluster) {
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
      // Here we will have something like clusterLoadStatusV5(...);
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
    .then(data => JSON.parse(data.response.text))
    .then(status => {
      dispatch(clusterLoadStatusSuccess(clusterId, status));
      return status;
    })
    .catch(error => {
      // TODO: Find a better way to deal with status endpoint errors in dev:
      // https://github.com/giantswarm/giantswarm/issues/6757
      if (window.config.environment === 'development') {
        dispatch(clusterLoadStatusSuccess(clusterId, mockedStatus));
      } else {
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

          throw error;
        }
      }
    });
}

/**
 * Takes a cluster object and tries to create it. Dispatches CLUSTER_CREATE_SUCCESS
 * on success or CLUSTER_CREATE_ERROR on error.
 *
 * @param {Object} cluster Cluster definition object
 */
export function clusterCreate(cluster) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_CREATE,
      cluster,
    });

    return clustersApi
      .addClusterWithHttpInfo(cluster)
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
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_DELETE_CONFIRMED,
      cluster,
    });

    return clustersApi
      .deleteCluster(cluster.id)
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
    // This method is going to work for NP clusters, now in local dev it is not
    // working, so early return if the cluster is a NP one.
    const nodePoolsClusters = getState().entities.clusters.nodePoolsClusters;
    const isNodePoolsCluster = nodePoolsClusters.includes(clusterId);
    if (isNodePoolsCluster) return Promise.resolve([]);

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

export const clusterLoadDetailsError = error => ({
  type: types.CLUSTER_LOAD_DETAILS_ERROR,
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

export const clusterCreateSuccess = cluster => ({
  type: types.CLUSTER_CREATE_SUCCESS,
  cluster,
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

export const clustersLoadSuccessV4 = (clusters, lastUpdated) => ({
  type: types.CLUSTERS_LOAD_SUCCESS_V4,
  clusters,
  lastUpdated,
});

export const clustersLoadSuccessV5 = (clusters, nodePoolsClusters) => ({
  type: types.CLUSTERS_LOAD_SUCCESS_V5,
  clusters,
  nodePoolsClusters,
});

export const clustersLoadErrorV4 = error => ({
  type: types.CLUSTERS_LOAD_ERROR_V4,
  error: error,
});

export const clustersLoadErrorV5 = error => ({
  type: types.CLUSTERS_LOAD_ERROR_V5,
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
export function clusterPatch(cluster, payload) {
  return function(dispatch) {
    // Optimistic update.
    dispatch({
      type: types.CLUSTER_PATCH,
      cluster,
      payload,
    });

    return clustersApi.modifyCluster(cluster.id, payload).catch(error => {
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
