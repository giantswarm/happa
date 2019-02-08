'use strict';

import * as types from '../actions/actionTypes';

export default function catalogsReducer(
  state = {
    lastUpdated: 0,
    isFetching: false,
    items: [],
  },
  action = undefined
) {
  switch (action.type) {
    case types.CATALOGS_LOAD:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: true,
        items: [],
      };

    case types.CATALOGS_LOAD_SUCCESS:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: action.catalogs,
      };

    case types.CATALOGS_LOAD_ERROR:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: state.items,
      };

    default:
      return state;
  }
}
