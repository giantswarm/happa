'use strict';

import * as types from '../actions/actionTypes';

export default function clusterReducer(state = {lastUpdated: 0, isFetching: false, items: {}}, action = undefined) {
  switch(action.type) {
    case types.CLUSTER_LOAD_PARTIAL_DETAILS:
      var items = Object.assign({}, state.items);

      items[action.cluster.id] = action.cluster;

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_LOAD_DETAILS_SUCCESS:
      console.log(action);
      var items = Object.assign({}, state.items);

      items[action.cluster.id] = action.cluster;

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    default:
      return state;
  }
}