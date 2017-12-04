'use strict';

import * as types from '../actions/actionTypes';
import _ from 'underscore';

export default function releaseReducer(state = {activeRelease: '', items: {}}, action = undefined) {
  switch(action.type) {
    case types.RELEASES_LOAD_SUCCESS:
      var items = {};
      var activeRelease = {};

      _.each(action.releases, (release) => {
        items[release.version] = release;

        if (release.active) {
          activeRelease = release.version;
        }
      });

      return {
        activeRelease,
        items
      };

    default:
      return state;
  }
}
