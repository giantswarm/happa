import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import GiantSwarm from 'giantswarm';

/**
 * updateAppConfig updates an appConfig
 *
 * @param {Object} appName The name of the app.
 * @param {Object} clusterID What cluster it is on.
 * @param {Object} values The values which will be set for the uservalues configmap.
 */
export function updateAppConfig(appName, clusterID, values) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_UPDATE_APP_CONFIG,
      clusterID,
      appName,
    });

    const appConfigsApi = new GiantSwarm.AppConfigsApi();

    return appConfigsApi
      .modifyClusterAppConfig(clusterID, appName, {
        body: values,
      })
      .then(() => {
        dispatch({
          type: types.CLUSTER_UPDATE_APP_CONFIG_SUCCESS,
          clusterID,
          appName,
        });

        new FlashMessage(
          `The configuration of <code>${appName}</code> on <code>${clusterID}</code> has successfully been updated.`,
          messageType.SUCCESS,
          messageTTL.LONG
        );
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_UPDATE_APP_CONFIG_ERROR,
          clusterID,
          appName,
        });

        if (error.status === 404) {
          new FlashMessage(
            `Could not find an app or app config to update for <code>${appName}</code> on cluster <code>${clusterID}</code>`,
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
            `Something went wrong while trying to update the ConfigMap. Please try again later or contact support: support@giantswarm.io`,
            messageType.ERROR,
            messageTTL.LONG
          );
        }
      });
  };
}

/**
 * createAppConfig creates an appConfig
 *
 * @param {Object} appName The name of the app.
 * @param {Object} clusterID What cluster it is on.
 * @param {Object} values The values which will be set for the uservalues configmap.
 */
export function createAppConfig(appName, clusterID, values) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_CREATE_APP_CONFIG,
      clusterID,
      appName,
    });

    const appConfigsApi = new GiantSwarm.AppConfigsApi();

    return appConfigsApi
      .createClusterAppConfig(clusterID, appName, {
        body: values,
      })
      .then(() => {
        dispatch({
          type: types.CLUSTER_CREATE_APP_CONFIG_SUCCESS,
          clusterID,
          appName,
        });

        new FlashMessage(
          `The ConfigMap for <code>${appName}</code> on <code>${clusterID}</code> has successfully been created.`,
          messageType.SUCCESS,
          messageTTL.LONG
        );
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_CREATE_APP_CONFIG_ERROR,
          clusterID,
          appName,
        });

        if (error.status === 404) {
          new FlashMessage(
            `Could not find an app to create a ConfigMap for <code>${appName}</code> on cluster <code>${clusterID}</code>`,
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
            `Something went wrong while trying to create the ConfigMap. Please try again later or contact support: support@giantswarm.io`,
            messageType.ERROR,
            messageTTL.LONG
          );
        }
      });
  };
}

/**
 * deleteAppConfig deletes an appConfig
 *
 * @param {Object} appName The name of the app.
 * @param {Object} clusterID What cluster it is on.
 */
export function deleteAppConfig(appName, clusterID) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_DELETE_APP_CONFIG,
      clusterID,
      appName,
    });

    const appConfigsApi = new GiantSwarm.AppConfigsApi();

    return appConfigsApi
      .deleteClusterAppConfig(clusterID, appName)
      .then(() => {
        dispatch({
          type: types.CLUSTER_DELETE_APP_CONFIG_SUCCESS,
          clusterID,
          appName,
        });

        new FlashMessage(
          `The ConfigMap for <code>${appName}</code> on <code>${clusterID}</code> has been deleted.`,
          messageType.SUCCESS,
          messageTTL.MEDIUM
        );
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_DELETE_APP_CONFIG_ERROR,
          clusterID,
          appName,
        });

        if (error.status === 404) {
          new FlashMessage(
            `Could not find ConfigMap for an app called <code>${appName}</code> on cluster <code>${clusterID}</code>`,
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
            `Something went wrong while trying to delete the ConfigMap. Please try again later or contact support: support@giantswarm.io`,
            messageType.ERROR,
            messageTTL.LONG
          );
        }
      });
  };
}
