import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { StatusCodes } from 'shared/constants';

import * as types from './actionTypes';
import { createAppConfig } from './appConfigActions';
import { createAppSecret } from './appSecretActions';

// selectCluster stores a clusterID in the state.
export function selectCluster(clusterID) {
  return { type: types.CLUSTER_SELECT, clusterID: clusterID };
}

/**
 * Loads apps for a cluster.
 *
 * @param {String} clusterId Cluster ID
 */
export function loadApps(clusterId) {
  return function (dispatch, getState) {
    const appsApi = new GiantSwarm.AppsApi();

    const v5Clusters = getState().entities.clusters.v5Clusters || [];
    const isV5Cluster = v5Clusters.includes(clusterId);

    let getClusterApps = appsApi.getClusterAppsV4.bind(appsApi);

    if (isV5Cluster) {
      getClusterApps = appsApi.getClusterAppsV5.bind(appsApi);
    }

    dispatch({
      type: types.CLUSTER_LOAD_APPS_REQUEST,
      clusterId,
    });

    return getClusterApps(clusterId)
      .then((apps) => {
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
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Error loading cluster apps:', error);

        dispatch({
          type: types.CLUSTER_LOAD_APPS_ERROR,
          id: clusterId,
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
export function installApp(app, clusterID) {
  return async function (dispatch, getState) {
    dispatch({
      type: types.CLUSTER_INSTALL_APP_REQUEST,
      clusterID,
      app,
    });

    const appsApi = new GiantSwarm.AppsApi();

    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterID);

    let createApp = appsApi.createClusterAppV4.bind(appsApi);

    if (isV5Cluster) {
      createApp = appsApi.createClusterAppV5.bind(appsApi);
    }

    try {
      if (Object.keys(app.valuesYAML).length !== 0) {
        await dispatch(createAppConfig(app.name, clusterID, app.valuesYAML));
      }

      if (Object.keys(app.secretsYAML).length !== 0) {
        await dispatch(createAppSecret(app.name, clusterID, app.secretsYAML));
      }

      await createApp(clusterID, app.name, {
        body: {
          spec: {
            catalog: app.catalog,
            name: app.chartName,
            namespace: app.namespace,
            version: app.version,
          },
        },
      }).catch((error) => {
        showAppInstallationErrorFlashMessage(app.name, clusterID, error);
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
 * appInstallationErrorFlashMessage provides flash messages for failed app creation.
 *
 * @param {string} appName Name of the app.
 * @param {string} clusterID Where we tried to install the app on.
 * @param {object} error The error that occured.
 */
function showAppInstallationErrorFlashMessage(appName, clusterID, error) {
  if (error.status === StatusCodes.Conflict) {
    new FlashMessage(
      `An app called <code>${appName}</code> already exists on cluster <code>${clusterID}</code>`,
      messageType.ERROR,
      messageTTL.LONG
    );
  } else if (error.status === StatusCodes.ServiceUnavailable) {
    new FlashMessage(
      `The cluster is not yet ready for app installation. Please try again in 5 to 10 minutes.`,
      messageType.ERROR,
      messageTTL.LONG
    );
  } else if (error.status === StatusCodes.BadRequest) {
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
export function deleteApp(appName, clusterID) {
  return function (dispatch, getState) {
    dispatch({
      type: types.CLUSTER_DELETE_APP_REQUEST,
      clusterID,
      appName,
    });

    const appsApi = new GiantSwarm.AppsApi();

    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterID);

    let removeApp = appsApi.deleteClusterAppV4.bind(appsApi);

    if (isV5Cluster) {
      removeApp = appsApi.deleteClusterAppV5.bind(appsApi);
    }

    return removeApp(clusterID, appName)
      .then(() => {
        new FlashMessage(
          `App <code>${appName}</code> was scheduled for deletion on <code>${clusterID}</code>. This may take a couple of minutes.`,
          messageType.SUCCESS,
          messageTTL.LONG
        );
      })
      .catch((error) => {
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
 * Takes an app and a cluster id and some values and tries to update the app to those values. Dispatches `CLUSTER_UPDATE_APP_SUCCESS`
 * on success or `CLUSTER_UPDATE_APP_ERROR` on error.
 *
 * @param {string} appName The name of the app
 * @param {string} clusterID Where to delete the app.
 * @param {Object} values The values you want to change in the app.
 */
export function updateApp(appName, clusterID, values) {
  return function (dispatch, getState) {
    dispatch({
      type: types.CLUSTER_UPDATE_APP_REQUEST,
      clusterID,
      appName,
    });

    const appsApi = new GiantSwarm.AppsApi();

    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterID);

    let modifyApp = appsApi.modifyClusterAppV4.bind(appsApi);

    if (isV5Cluster) {
      modifyApp = appsApi.modifyClusterAppV5.bind(appsApi);
    }

    return modifyApp(clusterID, appName, { body: values })
      .then(() => {
        new FlashMessage(
          `App <code>${appName}</code> on <code>${clusterID}</code> has been updated. Changes might take some time to take effect.`,
          messageType.SUCCESS,
          messageTTL.LONG
        );

        dispatch({
          type: types.CLUSTER_UPDATE_APP_SUCCESS,
          clusterID,
          appName,
        });

        return {
          error: '',
        };
      })
      .catch((error) => {
        const errorMessage =
          error?.message ||
          'Something went wrong while trying to update your app. Please try again later or contact support.';

        dispatch({
          type: types.CLUSTER_UPDATE_APP_ERROR,
          error: errorMessage,
        });

        return {
          error: errorMessage,
        };
      });
  };
}

/**
 * Takes a catalogName and an appVersion (which is a complex object, and must have a sources field)
 * and attempts to fetch the README it finds in the sources field.
 *
 * @param {string} catalogName The name of the catalog that the appVersion can be found in (Reducer needs to know this to update the store correctly)
 * @param {Object} appVersion An appVersion object, which is a single entry in the apps field of a catalog, referencing a specific version of an app.
 * @param {String[]} appVersion.sources[] A URL, ending in README.md
 */
export function loadAppReadme(catalogName, appVersion) {
  return async function (dispatch) {
    dispatch({
      type: types.CLUSTER_LOAD_APP_README_REQUEST,
      catalogName,
      appVersion,
    });

    if (!appVersion.sources) {
      dispatch({
        type: types.CLUSTER_LOAD_APP_README_ERROR,
        catalogName,
        appVersion,
        error: 'No list of sources to check for a README.',
      });

      return;
    }

    let readmeURL = appVersion.sources.find((url) => url.endsWith('README.md'));

    if (!readmeURL) {
      dispatch({
        type: types.CLUSTER_LOAD_APP_README_ERROR,
        catalogName,
        appVersion,
        error: 'This app does not reference a README file.',
      });

      return;
    }

    readmeURL = fixTestAppReadmeURLs(readmeURL);

    try {
      const response = await fetch(readmeURL, { mode: 'cors' });
      if (response.status !== StatusCodes.Ok) {
        throw new Error(
          `Error fetching Readme. Response Status: ${response.status}`
        );
      }
      const readmeText = await response.text();

      dispatch({
        type: types.CLUSTER_LOAD_APP_README_SUCCESS,
        catalogName,
        appVersion,
        readmeText,
      });
    } catch (error) {
      const errorMessage = 'Whoops';
      dispatch({
        type: types.CLUSTER_LOAD_APP_README_ERROR,
        catalogName,
        appVersion,
        error: errorMessage,
      });
    }
  };
}

/**
 * Looks at a readme URL and attempts to correct URLs
 * which are known not to work. Test apps have a version which is not yet
 * tagged in the git repo, but the path includes the commit sha, so we can
 * still get to the file at that commit.
 *
 * @param {string} readmeURL A URL that may or may not point to a README of a test app.
 */
// fixTestAppReadmeURLs
function fixTestAppReadmeURLs(readmeURL) {
  // Test app urls will have a semver version followed by a hyphen followed by
  // a long commit sha. We need to remove the version part. If the regex
  // doesn't match, then the string is returned as is.
  // https://regex101.com/r/K2dxdN/1
  const regexMatcher = /^(.*)\/v?[0-9]+\.[0-9]+\.[0-9]+-(.*)\/README\.md$/;
  const fixedReadmeURL = readmeURL.replace(regexMatcher, '$1/$2/README.md');

  return fixedReadmeURL;
}
