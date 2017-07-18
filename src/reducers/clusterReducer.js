'use strict';

import * as types from '../actions/actionTypes';
import update from 'react-addons-update';
import moment from 'moment';
import _ from 'underscore';

var metricKeys = [
  'cpu_cores',
  'cpu_used',
  'ram_available',
  'ram_used',
  'pod_count',
  'container_count',
  'node_storage_limit',
  'node_storage_used',
  'network_traffic_incoming',
  'network_traffic_outgoing'
];

// ensureMetricKeysAreAvailable
// ----------------------------
// Make sure that expected metrics keys are present on cluster and nodes
// since Desmotes will omit them if they are not found in Prometheus
var ensureMetricKeysAreAvailable = function (clusterDetails) {
  clusterDetails.metrics = clusterDetails.metrics || {};
  for (var metricKey of metricKeys) {
    clusterDetails.metrics[metricKey] = Object.assign(
      {},
      {
        value: 0,
        unit: 'unknown',
        timestamp: 0
      },
      clusterDetails.metrics[metricKey]
    );
    for (var node in clusterDetails.nodes) {
      if (clusterDetails.nodes.hasOwnProperty(node)) {
        clusterDetails.nodes[node][metricKey] = Object.assign(
          {},
          {
            value: 0,
            unit: 'unknown',
            timestamp: 0
          },
          clusterDetails.nodes[node][metricKey]
        );
      }
    }
  }

  return clusterDetails;
};

// determineIfOutdated
// ----------------------------
// Loop over all metrics and add outdated: true where the timestamp
// for a metric is too far in the past
var determineIfOutdated = function (clusterDetails) {

  clusterDetails.metrics = clusterDetails.metrics || {};
  for (var metricKey of metricKeys) {
    clusterDetails.metrics[metricKey] = Object.assign(
      {},
      clusterDetails.metrics[metricKey],
      { outdated: isOutdated(clusterDetails.metrics[metricKey].timestamp) }
    );

    for (var node in clusterDetails.nodes) {
      if (clusterDetails.nodes.hasOwnProperty(node)) {
        clusterDetails.nodes[node][metricKey] = Object.assign(
          {},
          clusterDetails.nodes[node][metricKey],
          { outdated: isOutdated(clusterDetails.metrics[metricKey].timestamp)  }
        );
      }
    }
  }

  return clusterDetails;
};

// isOutdated
// ----------------------
// Takes a timestamp and returns true or false if it is outdated

var isOutdated = function (timestamp) {
  var momentTime = moment.utc(timestamp);
  var now = moment.utc(moment());
  var diff = now.diff(momentTime, 'seconds');

  if (diff > 60) {
    return true;
  } else {
    return false;
  }
};

export default function clusterReducer(state = {lastUpdated: 0, isFetching: false, items: {}}, action = undefined) {
  var items;
  var clusterDetails;

  switch(action.type) {
    case types.CLUSTER_LOAD_SUCCESS:
      items = {};

      _.each(action.clusters, (cluster) => {
        items[cluster.id] = Object.assign({}, items[cluster.id], ensureMetricKeysAreAvailable(cluster));
        items[cluster.id].nodes = items[cluster.id].nodes || [];
        items[cluster.id].keyPairs = items[cluster.id].keyPairs || [];
      });

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_LOAD_ERROR:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        errorLoading: true,
        items: items
      };

    case types.CLUSTER_LOAD_DETAILS_SUCCESS:
      items = Object.assign({}, state.items);

      items[action.cluster.id] = Object.assign({}, items[action.cluster.id], action.cluster);

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_LOAD_DETAILS_ERROR:
      items = Object.assign({}, state.items);

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {errorLoading: true});

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_LOAD_METRICS:
      items = Object.assign({}, state.items);

      clusterDetails = update(items[action.clusterId], {
        metricsLoading: {$set: true}
      });

      items[action.clusterId] = clusterDetails;

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_LOAD_METRICS_SUCCESS:
      var nodes = {};
      var metrics = action.metrics;

      for (var metricName in metrics.nodes) {
        if (metrics.nodes.hasOwnProperty(metricName)) {
          if (metrics.nodes[metricName]) {
            for (var nodeMetric of metrics.nodes[metricName].instances) {
              nodes[nodeMetric.instance] = Object.assign({}, nodes[nodeMetric.instance]);
              nodes[nodeMetric.instance].id = nodeMetric.instance;
              nodes[nodeMetric.instance][metricName] = {
                value: nodeMetric.value,
                unit: metrics.nodes[metricName].unit,
                timestamp: nodeMetric.timestamp
              };
            }
          }
        }
      }

      items = Object.assign({}, state.items);

      clusterDetails = update(items[action.clusterId], {
        errorLoadingMetrics: {$set: false},
        metricsLoading: {$set: false},
        metricsLoadedFirstTime: {$set: true},
        metrics: {$set: metrics.cluster},
        nodes: {$set: nodes}
      });

      clusterDetails = ensureMetricKeysAreAvailable(clusterDetails);
      clusterDetails = determineIfOutdated(clusterDetails);

      items[action.clusterId] = clusterDetails;

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_LOAD_METRICS_ERROR:
      items = Object.assign({}, state.items);

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {errorLoadingMetrics: true});

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_LOAD_KEY_PAIRS:
      items = Object.assign({}, state.items);

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {isFetchingKeyPairs: true});

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_LOAD_KEY_PAIRS_SUCCESS:
      items = Object.assign({}, state.items);

      // Add expire_date to keyPairs based on ttl_hours
      var keyPairs = action.keyPairs.map((keyPair) => {
        keyPair.expire_date = moment(keyPair.create_date).utc().add(keyPair.ttl_hours, 'hours');
        return keyPair;
      });

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {isFetchingKeyPairs: false, keyPairs: keyPairs});

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_LOAD_KEY_PAIRS_ERROR:
      items = Object.assign({}, state.items);

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {isFetchingKeyPairs: false});

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    case types.CLUSTER_DELETE_SUCCESS:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: state.items
      };

    default:
      return state;
  }
}
