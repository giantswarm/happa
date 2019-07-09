/**
 * updateAppConfig updates an appConfig
 *
 * @param {Object} appName The name of the app.
 * @param {Object} clusterID What cluster it is on.
 * @param {Object} values The values which will be set for the uservalues configmap.
 */
export function updateAppConfig(appName, clusterID, values) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_UPDATE_APP_CONFIG,
      clusterID,
      app,
    });

    var appConfigsApi = new GiantSwarmV4.AppConfigsApi();

    return appConfigsApi
    .modifyClusterAppConfig(scheme + ' ' + token, clusterID, appName, {
      body: values,
    })
    .then(() => {
      dispatch({
        type: types.CLUSTER_UPDATE_APP_CONFIG_SUCCESS,
        clusterID,
        app,
      });

      new FlashMessage(
        `The configuration of <code>${app.name}</code> on <code>${clusterID}</code> has successfully been updated.`,
        messageType.SUCCESS,
        messageTTL.MEDIUM
      );
    })
    .catch(error => {
      dispatch({
        type: types.CLUSTER_UPDATE_APP_CONFIG_ERROR,
        clusterID,
        app,
      });

      if (error.status === 404) {
        new FlashMessage(
          `Could not find an app or app config to update for <code>${app.name}</code> on cluster <code>${clusterID}</code>`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else if (error.status === 400) {
        new FlashMessage(
          `The request appears to be invalid. Please make sure all fields are filled in correctly.`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          `Something went wrong while trying to update the user configuration ConfigMap. Please try again later or contact support: support@giantswarm.io`,
          messageType.ERROR,
          messageTTL.LONG
        );
      }
    });
  }
}

/**
 * createAppConfig creates an appConfig
 *
 * @param {Object} appName The name of the app.
 * @param {Object} clusterID What cluster it is on.
 * @param {Object} values The values which will be set for the uservalues configmap.
 */
export function createAppConfig(appName, clusterID, values) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_CREATE_APP_CONFIG,
      clusterID,
      app,
    });

    var appConfigsApi = new GiantSwarmV4.AppConfigsApi();

    return appConfigsApi
    .createClusterAppConfig(scheme + ' ' + token, clusterID, appName, {
      body: values,
    })
    .then(() => {
      dispatch({
        type: types.CLUSTER_CREATE_APP_CONFIG_SUCCESS,
        clusterID,
        app,
      });

      new FlashMessage(
        `A user configuration configmap for <code>${app.name}</code> on <code>${clusterID}</code> has successfully been created.`,
        messageType.SUCCESS,
        messageTTL.MEDIUM
      );
    })
    .catch(error => {
      dispatch({
        type: types.CLUSTER_CREATE_APP_CONFIG_ERROR,
        clusterID,
        app,
      });

      if (error.status === 404) {
        new FlashMessage(
          `Could not find an app to create a user configuration configmap for <code>${app.name}</code> on cluster <code>${clusterID}</code>`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else if (error.status === 400) {
        new FlashMessage(
          `The request appears to be invalid. Please make sure all fields are filled in correctly.`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          `Something went wrong while trying to create the user configuration configmap. Please try again later or contact support: support@giantswarm.io`,
          messageType.ERROR,
          messageTTL.LONG
        );
      }
    });
  }
}

/**
 * deleteAppConfig deletes an appConfig
 *
 * @param {Object} appName The name of the app.
 * @param {Object} clusterID What cluster it is on.
 */
export function createAppConfig(appName, clusterID, values) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.CLUSTER_DELETE_APP_CONFIG,
      clusterID,
      app,
    });

    var appConfigsApi = new GiantSwarmV4.AppConfigsApi();

    return appConfigsApi
    .createClusterAppConfig(scheme + ' ' + token, clusterID, appName, {
      body: values,
    })
    .then(() => {
      dispatch({
        type: types.CLUSTER_DELETE_APP_CONFIG_SUCCESS,
        clusterID,
        app,
      });

      new FlashMessage(
        `The user configuration configmap for <code>${app.name}</code> on <code>${clusterID}</code> has been deleted.`,
        messageType.SUCCESS,
        messageTTL.MEDIUM
      );
    })
    .catch(error => {
      dispatch({
        type: types.CLUSTER_DELETE_APP_CONFIG_ERROR,
        clusterID,
        app,
      });

      if (error.status === 404) {
        new FlashMessage(
          `Could not find an app called <code>${app.name}</code> on cluster <code>${clusterID}</code>`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else if (error.status === 400) {
        new FlashMessage(
          `The request appears to be invalid. Please try again later or contact support: support@giantswarm.io.`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          `Something went wrong while trying to delete the user configuration configmap. Please try again later or contact support: support@giantswarm.io`,
          messageType.ERROR,
          messageTTL.LONG
        );
      }
    });
  }
}