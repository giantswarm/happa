import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { StatusCodes } from 'shared/constants';

import * as types from './actionTypes';

// selectCluster stores a clusterID in the state.
export function selectCluster(clusterID) {
  return { type: types.CLUSTER_SELECT, clusterID: clusterID };
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
