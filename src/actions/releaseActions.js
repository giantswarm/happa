'use strict';

import * as types from './actionTypes';
import GiantSwarmV4 from 'giantswarm-v4';

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
  return function(dispatch) {
    dispatch(releasesLoad());

    var releasesApi = new GiantSwarmV4.ReleasesApi();

    return releasesApi.getReleases()
    .then((releases) => {
      dispatch(releasesLoadSuccess(releases));
    })
    .catch((error) => {
      dispatch(releasesLoadError(error));
      throw(error);
    });
  };
}


