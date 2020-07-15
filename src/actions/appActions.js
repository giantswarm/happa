import { StatusCodes } from 'shared/constants';

import * as types from './actionTypes';

// selectCluster stores a clusterID in the state.
export function selectCluster(clusterID) {
  return { type: types.CLUSTER_SELECT, clusterID: clusterID };
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
