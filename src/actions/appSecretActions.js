import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { StatusCodes } from 'shared/constants';

import * as types from './actionTypes';

/**
 * updateAppSecret updates an appSecret
 *
 * @param {Object} appName The name of the app.
 * @param {Object} clusterID What cluster it is on.
 * @param {Object} values The values which will be set for the secret.
 */
export function updateAppSecret(appName, clusterID, values) {
  return function(dispatch, getState) {
    dispatch({
      type: types.CLUSTER_UPDATE_APP_SECRET,
      clusterID,
      appName,
    });

    const appSecretsApi = new GiantSwarm.AppSecretsApi();

    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterID);

    let updateClusterAppSecret = appSecretsApi.modifyClusterAppSecretV4.bind(
      appSecretsApi
    );

    if (isV5Cluster) {
      updateClusterAppSecret = appSecretsApi.modifyClusterAppSecretV5.bind(
        appSecretsApi
      );
    }

    return updateClusterAppSecret(clusterID, appName, {
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

        if (error.status === StatusCodes.NotFound) {
          new FlashMessage(
            `Could not find an app or app secret to update for <code>${appName}</code> on cluster <code>${clusterID}</code>`,
            messageType.ERROR,
            messageTTL.LONG
          );
        } else if (error.status === StatusCodes.BadRequest) {
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
  return function(dispatch, getState) {
    dispatch({
      type: types.CLUSTER_CREATE_APP_SECRET,
      clusterID,
      appName,
    });

    const appSecretsApi = new GiantSwarm.AppSecretsApi();

    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterID);

    let createClusterAppSecret = appSecretsApi.createClusterAppSecretV4.bind(
      appSecretsApi
    );

    if (isV5Cluster) {
      createClusterAppSecret = appSecretsApi.createClusterAppSecretV5.bind(
        appSecretsApi
      );
    }

    return createClusterAppSecret(clusterID, appName, {
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

        if (error.status === StatusCodes.NotFound) {
          new FlashMessage(
            `Could not find <code>${appName}</code> on cluster <code>${clusterID}</code>`,
            messageType.ERROR,
            messageTTL.LONG
          );
        } else if (error.status === StatusCodes.BadRequest) {
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
  return function(dispatch, getState) {
    dispatch({
      type: types.CLUSTER_DELETE_APP_SECRET,
      clusterID,
      appName,
    });

    const appSecretsApi = new GiantSwarm.AppSecretsApi();

    const v5Clusters = getState().entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(clusterID);

    let deleteClusterAppSecret = appSecretsApi.deleteClusterAppSecretV4.bind(
      appSecretsApi
    );

    if (isV5Cluster) {
      deleteClusterAppSecret = appSecretsApi.deleteClusterAppSecretV5.bind(
        appSecretsApi
      );
    }

    return deleteClusterAppSecret(clusterID, appName)
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

        if (error.status === StatusCodes.NotFound) {
          new FlashMessage(
            `Could not find the Secret for an app called <code>${appName}</code> on cluster <code>${clusterID}</code>`,
            messageType.ERROR,
            messageTTL.LONG
          );
        } else if (error.status === StatusCodes.BadRequest) {
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
