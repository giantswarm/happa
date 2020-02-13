import GiantSwarm from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import cmp from 'semver-compare';

import * as types from './actionTypes';

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

          dispatch({
            type: types.RELEASES_LOAD_ERROR,
            error: 'No releases found.',
          });

          return;
        }

        const releases = allReleases.reduce((accumulator, release) => {
          return { ...accumulator, [release.version]: release };
        }, {});

        const activeSortedReleases = Object.keys(releases)
          // TODO remove second condition
          .filter(release => releases[release].active || release === '10.0.0')
          .sort(cmp)
          .reverse();

        if (activeSortedReleases.length === 0) {
          new FlashMessage(
            'Something went wrong while processing the list of releases. No active releases found.',
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
      .catch(error => {
        dispatch({ type: types.RELEASES_LOAD_ERROR, error });

        new FlashMessage(
          'Something went wrong while trying to fetch the list of releases.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );
      });
  };
}
