import { push } from 'connected-react-router';
import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import moment from 'moment';
import cmp from 'semver-compare';
import { Providers, StatusCodes } from 'shared/constants';

import * as types from './actionTypes';

// API instantiations.
const clustersApi = new GiantSwarm.ClustersApi();

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

// This is a helper function that transforms an array of clusters into an object
// of clusters with its ids as keys. Also we add some data to the clusters objects.
function clustersLoadArrayToObject(clusters, provider) {
  return clusters
    .map(cluster => {
      return {
        ...cluster,
        lastUpdated: Date.now(),
        nodes: cluster.nodes || [],
        keyPairs: cluster.keyPairs || [],
        scaling: cluster.scaling || {},
        capabilities: computeCapabilities(cluster, provider),
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
  return function(dispatch, getState) {
    if (withLoadingFlags) dispatch({ type: types.CLUSTERS_LIST_REQUEST });

    // Fetch all clusters.
    return clustersApi
      .getClusters()
      .then(data => {
        const provider = getState().app.info.general.provider;
        const clusters = clustersLoadArrayToObject(data, provider);

        const v5ClusterIds = data
          .filter(cluster => cluster.path.startsWith('/v5'))
          .map(cluster => cluster.id);

        dispatch({ type: types.CLUSTERS_LIST_SUCCESS, clusters, v5ClusterIds });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
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
      if (error.status === StatusCodes.NotFound) {
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
 * If the app has valuesYAML or secretsYAML set to a non empty object, then
 * this will first try to create the user config configmap and/or secret
 * before creating the app.
 *
 * @param {Object} app App definition object.
 * @param {Object} clusterID Where to install the app.
 */
export function clusterInstallApp(app, clusterID) {
  return async function(dispatch) {
    dispatch({
      type: types.CLUSTER_INSTALL_APP,
      clusterID,
      app,
    });

    const appsApi = new GiantSwarm.AppsApi();
    const appConfigsApi = new GiantSwarm.AppConfigsApi();
    const appSecretsApi = new GiantSwarm.AppSecretsApi();

    try {
      // If we have user config that we want to create, then
      // fire off the call to create it.
      Object.keys(app.valuesYAML).length !== 0 &&
        (await appConfigsApi
          .createClusterAppConfig(clusterID, app.name, {
            body: app.valuesYAML,
          })
          .catch(error => {
            appConfigErrorFlashMessages(
              'ConfigMap',
              app.name,
              clusterID,
              error
            );
            throw error;
          }));

      // If we have an app secret that we want to create, then
      // fire off the call to create it.
      Object.keys(app.secretsYAML).length !== 0 &&
        (await appSecretsApi
          .createClusterAppSecret(clusterID, app.name, {
            body: app.secretsYAML,
          })
          .catch(error => {
            appConfigErrorFlashMessages('Secret', app.name, clusterID, error);
            throw error;
          }));

      await appsApi
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
          appInstallationErrorFlashMessage(app, clusterID, error);
          throw error;
        });

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
    } catch (error) {
      dispatch({
        type: types.CLUSTER_INSTALL_APP_ERROR,
        clusterID,
        app,
        error,
      });

      throw error;
    }
  };
}

/**
 * appConfigErrorFlashMessages provides flash messages when something went wrong
 * when creating either the ConfigMap or Secret during app installation.
 *
 * @param {string} resource Name of the resource we were trying to create.
 * @param {string} appName Name of the app.
 * @param {string} clusterID Where we tried to install the app on.
 *  @param {object} error The error that occured.
 */
// a
// while creating a resource (ConfigMap or Secret) for an app.
function appConfigErrorFlashMessages(thing, app, clusterID, error) {
  if (error.status === 409) {
    new FlashMessage(
      `The ${thing} for <code>${app.name}</code> already exists on cluster <code>${clusterID}</code>`,
      messageType.ERROR,
      messageTTL.LONG
    );
  } else if (error.status === 400) {
    new FlashMessage(
      `Your ${thing} appears to be invalid. Please make sure all fields are filled in correctly.`,
      messageType.ERROR,
      messageTTL.LONG
    );
  } else {
    new FlashMessage(
      `Something went wrong while trying to create the ${thing}. Please try again later or contact support: support@giantswarm.io`,
      messageType.ERROR,
      messageTTL.LONG
    );
  }
}

/**
 * appInstallationErrorFlashMessage provides flash messages for failed app creation.
 *
 * @param {string} appName Name of the app.
 * @param {string} clusterID Where we tried to install the app on.
 *  @param {object} error The error that occured.
 */
function appInstallationErrorFlashMessage(appName, clusterID, error) {
  if (error.status === 409) {
    new FlashMessage(
      `An app called <code>${appName}</code> already exists on cluster <code>${clusterID}</code>`,
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
 * @param {String} clusterId Cluster ID
 */
export function clusterLoadDetails(clusterId) {
  return async function(dispatch, getState) {
    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterId);

    dispatch({
      type: types.CLUSTER_LOAD_DETAILS_REQUEST,
      clusterId,
    });

    try {
      const cluster = isV5Cluster
        ? await clustersApi.getClusterV5(clusterId)
        : await clustersApi.getCluster(clusterId);

      dispatch(clusterLoadStatus(clusterId)); // TODO

      cluster.capabilities = computeCapabilities(
        cluster,
        getState().app.info.general.provider
      );

      if (isV5Cluster) cluster.nodePools = [];

      dispatch({
        type: types.CLUSTER_LOAD_DETAILS_SUCCESS,
        cluster,
      });

      return cluster;
    } catch (error) {
      if (error.status === StatusCodes.NotFound) {
        new FlashMessage(
          'This cluster no longer exists.',
          messageType.INFO,
          messageTTL.MEDIUM,
          'Redirecting you to your organization clusters list'
        );

        // Delete the cluster in te store.
        // eslint-disable-next-line no-use-before-define
        dispatch(clusterDeleteSuccess(clusterId));
        dispatch(push('/'));

        return {};
      }

      // eslint-disable-next-line no-console
      console.error('Error loading cluster details:', error);
      // eslint-disable-next-line no-use-before-define
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
      // eslint-disable-next-line no-use-before-define
      dispatch(clusterLoadStatusSuccess(clusterId, status));

      return status;
    })
    .catch(error => {
      // TODO: Find a better way to deal with status endpoint errors in dev:
      // https://github.com/giantswarm/giantswarm/issues/6757
      // eslint-disable-next-line no-console
      console.error(error);
      if (error.status === StatusCodes.NotFound) {
        // eslint-disable-next-line no-use-before-define
        dispatch(clusterLoadStatusNotFound(clusterId));
      } else {
        // eslint-disable-next-line no-use-before-define
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

        return { clusterId, owner: cluster.owner };
      })
      .catch(error => {
        // eslint-disable-next-line no-use-before-define
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
      .then(data => {
        // eslint-disable-next-line no-use-before-define
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

        // eslint-disable-next-line no-console
        console.error(error);

        // eslint-disable-next-line no-use-before-define
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
  return function(dispatch) {
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
