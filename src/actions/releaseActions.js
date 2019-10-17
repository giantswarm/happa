import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import cmp from 'semver-compare';
import GiantSwarm from 'giantswarm';

export function loadReleases() {
  return function(dispatch) {
    const releasesApi = new GiantSwarm.ReleasesApi();

    return releasesApi
      .getReleases()
      .then(allReleases => {
        const releases = allReleases.reduce((accumulator, release) => {
          return { ...accumulator, [release.version]: release };
        }, {});

        const activeSortedReleases = Object.keys(releases)
          .filter(release => releases[release].active)
          .sort(cmp)
          .reverse();

        dispatch({
          type: types.RELEASES_LOAD_SUCCESS,
          releases,
          activeSortedReleases,
        });
      })
      .catch(error => {
        dispatch({ type: types.RELEASES_LOAD_ERROR });

        new FlashMessage(
          'Something went wrong while trying to fetch the list of releases.',
          messageType.ERROR,
          messageTTL.LONG,
          'please try again later or contact support: support@giantswarm.io'
        );

        throw error;
      });
  };
}
