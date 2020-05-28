import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import cmp from 'semver-compare';

import * as types from './actionTypes';

export function loadReleases() {
  return function (dispatch, getState) {
    const releasesApi = new GiantSwarm.ReleasesApi();

    return releasesApi
      .getReleases()
      .then((allReleases) => {
        if (allReleases.length === 0) {
          new FlashMessage(
            'No releases found.',
            messageType.ERROR,
            messageTTL.LONG,
            'Please try again later or contact support: support@giantswarm.io'
          );

          dispatch({
            type: types.RELEASES_LOAD_ERROR,
            error: 'No releases found.',
          });

          return;
        }

        const releases = allReleases.reduce((accumulator, release) => {
          return { ...accumulator, [release.version]: release };
        }, {});

        let activeSortedReleases = Object.keys(releases).sort(cmp).reverse();

        if (!getState().main.loggedInUser.isAdmin) {
          activeSortedReleases = activeSortedReleases.filter(
            (release) => releases[release].active
          );
        }

        if (activeSortedReleases.length === 0) {
          new FlashMessage(
            'No active releases found.',
            messageType.ERROR,
            messageTTL.LONG,
            'Please try again later or contact support: support@giantswarm.io'
          );

          dispatch({
            type: types.RELEASES_LOAD_ERROR,
            error: 'No active releases found.',
          });
        } else {
          dispatch({
            type: types.RELEASES_LOAD_SUCCESS,
            releases,
            activeSortedReleases,
          });
        }
      })
      .catch((error) => {
        dispatch({ type: types.RELEASES_LOAD_ERROR, error: error.message });

        new FlashMessage(
          'Something went wrong while trying to fetch the list of releases.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );
      });
  };
}
