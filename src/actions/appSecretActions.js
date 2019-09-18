import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import GiantSwarm from 'giantswarm';

/**
 * updateAppSecret updates an appSecret
 *
 * @param {Object} appName The name of the app.
 * @param {Object} clusterID What cluster it is on.
 * @param {Object} values The values which will be set for the secret.
 */
export function updateAppSecret(appName, clusterID, values) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_UPDATE_APP_SECRET,
      clusterID,
      appName,
    });

    var appSecretsApi = new GiantSwarm.AppSecretsApi();

    return appSecretsApi
      .modifyClusterAppSecret(clusterID, appName, {
        body: values,
      })
      .then(() => {
        dispatch({
          type: types.CLUSTER_UPDATE_APP_SECRET_SUCCESS,
          clusterID,
          appName,
        });

        new FlashMessage(
          `The Secret of <code>${appName}</code> on <code>${clusterID}</code> has successfully been updated.`,
          messageType.SUCCESS,
          messageTTL.LONG
        );
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_UPDATE_APP_SECRET_ERROR,
          clusterID,
          appName,
        });

        if (error.status === 404) {
          new FlashMessage(
            `Could not find an app or app secret to update for <code>${appName}</code> on cluster <code>${clusterID}</code>`,
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
            `Something went wrong while trying to update the Secret. Please try again later or contact support: support@giantswarm.io`,
            messageType.ERROR,
            messageTTL.LONG
          );
        }
      });
  };
}

/**
 * createAppSecret creates a Secret for an app.
 *
 * @param {Object} appName The name of the app.
 * @param {Object} clusterID What cluster it is on.
 * @param {Object} values The values which will be set for the secret
 */
export function createAppSecret(appName, clusterID, values) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_CREATE_APP_SECRET,
      clusterID,
      appName,
    });

    var appSecretsApi = new GiantSwarm.AppSecretsApi();

    return appSecretsApi
      .createClusterAppSecret(clusterID, appName, {
        body: values,
      })
      .then(() => {
        dispatch({
          type: types.CLUSTER_CREATE_APP_SECRET_SUCCESS,
          clusterID,
          appName,
        });

        new FlashMessage(
          `A Secret for <code>${appName}</code> on <code>${clusterID}</code> has successfully been created.`,
          messageType.SUCCESS,
          messageTTL.LONG
        );
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_CREATE_APP_SECRET_ERROR,
          clusterID,
          appName,
        });

        if (error.status === 404) {
          new FlashMessage(
            `Could not find <code>${appName}</code> on cluster <code>${clusterID}</code>`,
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
            `Something went wrong while trying to create the Secret. Please try again later or contact support: support@giantswarm.io`,
            messageType.ERROR,
            messageTTL.LONG
          );
        }
      });
  };
}

/**
 * deleteAppSecret deletes an appSecret
 *
 * @param {Object} appName The name of the app.
 * @param {Object} clusterID What cluster it is on.
 */
export function deleteAppSecret(appName, clusterID) {
  return function(dispatch) {
    dispatch({
      type: types.CLUSTER_DELETE_APP_SECRET,
      clusterID,
      appName,
    });

    var appSecretsApi = new GiantSwarm.AppSecretsApi();

    return appSecretsApi
      .deleteClusterAppSecret(clusterID, appName)
      .then(() => {
        dispatch({
          type: types.CLUSTER_DELETE_APP_SECRET_SUCCESS,
          clusterID,
          appName,
        });

        new FlashMessage(
          `The Secret for <code>${appName}</code> on <code>${clusterID}</code> has been deleted.`,
          messageType.SUCCESS,
          messageTTL.MEDIUM
        );
      })
      .catch(error => {
        dispatch({
          type: types.CLUSTER_DELETE_APP_SECRET_ERROR,
          clusterID,
          appName,
        });

        if (error.status === 404) {
          new FlashMessage(
            `Could not find the Secret for an app called <code>${appName}</code> on cluster <code>${clusterID}</code>`,
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
            `Something went wrong while trying to delete the Secret. Please try again later or contact support: support@giantswarm.io`,
            messageType.ERROR,
            messageTTL.LONG
          );
        }
      });
  };
}