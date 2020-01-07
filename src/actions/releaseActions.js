import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import GiantSwarm from 'giantswarm';
import cmp from 'semver-compare';

export function loadReleases() {
  return function(dispatch) {
    const releasesApi = new GiantSwarm.ReleasesApi();

    return releasesApi
      .getReleases()
      .then(allReleases => {
        if (allReleases.length === 0) {
          new FlashMessage(
            'Something went wrong while trying to fetch the list of releases. No releases found.',
            messageType.ERROR,
            messageTTL.LONG,
            'Please try again later or contact support: support@giantswarm.io'
          );
        }

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
          'Please try again later or contact support: support@giantswarm.io'
        );

        throw error;
      });
  };
}
