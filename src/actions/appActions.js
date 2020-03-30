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
  return async function (dispatch, getState) {
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

    try {
      const apps = await getClusterApps(clusterId);
      const appsArray = Array.from(apps);
      dispatch({
        type: types.CLUSTER_LOAD_APPS_SUCCESS,
        clusterId,
        apps: appsArray,
      });
    } catch (error) {
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
    }
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
    } catch (error) {
      dispatch({
        type: types.CLUSTER_INSTALL_APP_ERROR,
        clusterID,
        app,
        error,
      });

      return {
        error: 'Problem creating app config.',
      };
    }

    try {
      if (Object.keys(app.secretsYAML).length !== 0) {
        await dispatch(createAppSecret(app.name, clusterID, app.secretsYAML));
      }
    } catch (error) {
      dispatch({
        type: types.CLUSTER_INSTALL_APP_ERROR,
        clusterID,
        app,
        error,
      });

      return {
        error: 'Problem creating app secret.',
      };
    }

    try {
      await createApp(clusterID, app.name, {
        body: {
          spec: {
            catalog: app.catalog,
            name: app.chartName,
            namespace: app.namespace,
            version: app.version,
          },
        },
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

      return { error: '' };
    } catch (error) {
      showAppInstallationErrorFlashMessage(app.name, clusterID, error);

      dispatch({
        type: types.CLUSTER_INSTALL_APP_ERROR,
        id: clusterID,
        error,
      });

      return { error: 'Problem installing app.' };
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
  return async function (dispatch, getState) {
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

    try {
      await removeApp(clusterID, appName);

      dispatch({
        type: types.CLUSTER_DELETE_APP_SUCCESS,
        clusterID,
        appName,
      });

      new FlashMessage(
        `App <code>${appName}</code> will be deleted on <code>${clusterID}</code>`,
        messageType.SUCCESS,
        messageTTL.LONG
      );
    } catch (error) {
      const errorMessage =
        error?.message ||
        'Something went wrong while trying to delete your app. Please try again later or contact support.';

      new FlashMessage(errorMessage, messageType.ERROR, messageTTL.LONG);

      dispatch({
        type: types.CLUSTER_DELETE_APP_ERROR,
        error: errorMessage,
      });
    }
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
  return async function (dispatch, getState) {
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

    try {
      await modifyApp(clusterID, appName, { body: values });

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
    } catch (error) {
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
    }
  };
}
