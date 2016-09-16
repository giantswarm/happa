'use strict';

import * as types from '../actions/actionTypes';

export default function clusterReducer(state = {lastUpdated: 0, isFetching: false, items: {}}, action = undefined) {
  switch(action.type) {
    case types.CLUSTER_LOAD_PARTIAL_DETAILS:
      var items = Object.assign({}, state.items);

      items[action.cluster.id] = action.cluster;
      items[action.cluster.id].nodes = [];

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_LOAD_DETAILS_SUCCESS:
      var items = Object.assign({}, state.items);

      items[action.cluster.id] = Object.assign({}, action.cluster);

      if (action.cluster.nodes) {
        items[action.cluster.id].nodes = action.cluster.nodes.map((node) => { return node.internal_ip; });
      } else {
        items[action.cluster.id].nodes = [];
      }

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    default:
      return state;
  }
}