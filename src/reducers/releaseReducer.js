'use strict';

import * as types from '../actions/actionTypes';
import _ from 'underscore';

export default function releaseReducer(state = {items: {}}, action = undefined) {
  switch(action.type) {
    case types.RELEASES_LOAD_SUCCESS:
      var items = {};

      _.each(action.releases, (release) => {
        if (release.active) items[release.version] = release;
      });

      return {
        items
      };

    default:
      return state;
  }
}
