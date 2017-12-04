'use strict';

import * as types from './actionTypes';
import GiantSwarm from '../lib/giantswarm_client_wrapper';

export function releasesLoad() {
  return {
    type: types.RELEASES_LOAD
  };
}

export function releasesLoadSuccess(releases) {
  return {
    type: types.RELEASES_LOAD_SUCCESS,
    releases
  };
}

export function releasesLoadError(error) {
  return {
    type: types.RELEASES_LOAD_ERROR,
    error
  };
}

export function loadReleases() {
  return function(dispatch, getState) {
    dispatch(releasesLoad());

    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.releases()
    .then((data) => {
      dispatch(releasesLoadSuccess(data.result));
    })
    .catch((error) => {
      dispatch(releasesLoadError(error));
      throw(error);
    });
  };
}


