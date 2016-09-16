'use strict';

import * as types from '../actions/actionTypes';
import _ from 'underscore';

export default function clusterReducer(state = {lastUpdated: 0, isFetching: false, items: {}}, action = undefined) {
  switch(action.type) {
    case types.CLUSTER_LOAD_DETAILS_SUCCESS:
      var items = Object.assign({}, state.items);

      _.each(action.cluster.nodes, (node) => {
        items[node.internal_ip] = node;
      });

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    default:
      return state;
  }
}