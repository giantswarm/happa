import * as types from './actionTypes';
import GiantSwarm from 'giantswarm';

const releasesLoad = () => ({
  type: types.RELEASES_LOAD,
});

const releasesLoadSuccess = releases => ({
  type: types.RELEASES_LOAD_SUCCESS,
  releases,
});

const releasesLoadError = error => ({
  type: types.RELEASES_LOAD_ERROR,
  error,
});

export function loadReleases() {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch(releasesLoad());

    var releasesApi = new GiantSwarm.ReleasesApi();

    return releasesApi
      .getReleases(scheme + ' ' + token)
      .then(releases => {
        const versionKeyedReleases = releases.reduce((accumulator, release) => {
          return { ...accumulator, [release.version]: release };
        }, {});

        console.log(versionKeyedReleases);
        dispatch(releasesLoadSuccess(versionKeyedReleases));
      })
      .catch(error => {
        dispatch(releasesLoadError(error));
        throw error;
      });
  };
}
