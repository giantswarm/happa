import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import GiantSwarm from 'giantswarm';

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
  return function(dispatch, getState) {
    const appsApi = new GiantSwarm.AppsApi();

    const nodePoolsClusters = getState().entities.clusters.nodePoolsClusters;
    const isNodePoolsCluster = nodePoolsClusters.includes(clusterId);

    let getClusterAppsFunc;
    if (isNodePoolsCluster) {
      getClusterAppsFunc = appsApi.getClusterAppsV5.bind(appsApi);
    } else {
      getClusterAppsFunc = appsApi.getClusterAppsV4.bind(appsApi);
    }

    dispatch({
      type: types.CLUSTER_LOAD_APPS,
      clusterId,
    });

    return getClusterAppsFunc(clusterId)
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
export function installApp(app, clusterID) {
  return function(dispatch, getState) {
    dispatch({
      type: types.CLUSTER_INSTALL_APP,
      clusterID,
      app,
    });

    const appsApi = new GiantSwarm.AppsApi();
    const appConfigsApi = new GiantSwarm.AppConfigsApi();

    const nodePoolsClusters = getState().entities.clusters.nodePoolsClusters;
    const isNodePoolsCluster = nodePoolsClusters.includes(clusterID);

    let createAppConfigurationFunc;
    let createAppFunc;
    if (isNodePoolsCluster) {
      createAppConfigurationFunc = appConfigsApi.createClusterAppConfigV5.bind(
        appConfigsApi
      );
      createAppFunc = appsApi.createClusterAppV5.bind(appsApi);
    } else {
      createAppConfigurationFunc = appConfigsApi.createClusterAppConfigV4.bind(
        appConfigsApi
      );
      createAppFunc = appsApi.createClusterAppV4.bind(appsApi);
    }

    var optionalCreateAppConfiguration = new Promise((resolve, reject) => {
      if (Object.keys(app.valuesYAML).length !== 0) {
        // If we have user config that we want to create, then
        // fire off the call to create it.
        createAppConfigurationFunc(clusterID, app.name, {
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
        return createAppFunc(clusterID, app.name, {
          body: {
            spec: {
              catalog: app.catalog,
              name: app.chartName,
              namespace: app.namespace,
              version: app.version,
            },
          },
        }).catch(error => {
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
export function deleteApp(appName, clusterID) {
  return function(dispatch, getState) {
    dispatch({
      type: types.CLUSTER_DELETE_APP,
      clusterID,
      appName,
    });

    const appsApi = new GiantSwarm.AppsApi();

    const nodePoolsClusters = getState().entities.clusters.nodePoolsClusters;
    const isNodePoolsCluster = nodePoolsClusters.includes(clusterID);

    let deleteAppFunc;
    if (isNodePoolsCluster) {
      deleteAppFunc = appsApi.deleteClusterAppV5.bind(appsApi);
    } else {
      deleteAppFunc = appsApi.deleteClusterAppV4.bind(appsApi);
    }

    return deleteAppFunc(clusterID, appName)
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
