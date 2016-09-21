'use strict';

import * as types from '../actions/actionTypes';
import update from 'react-addons-update';

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

      break;

    case types.CLUSTER_LOAD_DETAILS_SUCCESS:
      var items = Object.assign({}, state.items);

      items[action.cluster.id] = Object.assign({}, items[action.cluster.id], action.cluster);



      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

      break;

    case types.CLUSTER_LOAD_METRICS_SUCCESS:
      var nodes = {};
      var clusterMetrics = action.clusterMetrics;

      for (var nodeMetricKey in action.clusterMetrics.nodes) {
        if (action.clusterMetrics.nodes.hasOwnProperty(nodeMetricKey)) {
          var metricName = nodeMetricKey;
          var metricUnit = action.clusterMetrics.nodes[nodeMetricKey].unit;

          for (var nodeMetric of action.clusterMetrics.nodes[nodeMetricKey].instances) {
            nodes[nodeMetric.instance] = Object.assign({}, nodes[nodeMetric.instance]);
            nodes[nodeMetric.instance][metricName] = {
              value: nodeMetric.value,
              unit: action.clusterMetrics.nodes[nodeMetricKey].unit,
              timestamp: nodeMetric.timestamp
            };
          }
        }
      }

      var items = Object.assign({}, state.items);

      var clusterDetails = update(items[action.clusterId], {
        metrics: {$set: clusterMetrics.cluster},
        nodes: {$set: nodes}
      });

      items[action.clusterId] = clusterDetails;

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

      break;


    default:
      return state;
  }
}
