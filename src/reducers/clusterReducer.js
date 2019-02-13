'use strict';

import * as types from '../actions/actionTypes';
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
  'network_traffic_outgoing',
];

// ensureMetricKeysAreAvailable
// ----------------------------
// Make sure that expected metrics keys are present on cluster and nodes
// since Desmotes will omit them if they are not found in Prometheus
var ensureMetricKeysAreAvailable = function(clusterDetails) {
  clusterDetails.metrics = clusterDetails.metrics || {};
  for (var metricKey of metricKeys) {
    clusterDetails.metrics[metricKey] = Object.assign(
      {},
      {
        value: 0,
        unit: 'unknown',
        timestamp: 0,
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
            timestamp: 0,
          },
          clusterDetails.nodes[node][metricKey]
        );
      }
    }
  }

  return clusterDetails;
};

// ensureWorkersHaveAWSkey
// -----------------------
// Since the API omits the 'aws' key from workers on kvm installations, I will
// add it back here with dummy values if it is not present.
var ensureWorkersHaveAWSkey = function(clusterDetails) {
  clusterDetails.workers = clusterDetails.workers || [];

  for (var i = 0; i < clusterDetails.workers.length; i++) {
    clusterDetails.workers[i].aws = clusterDetails.workers[i].aws || {
      instance_type: '',
    };
  }

  return clusterDetails;
};

export default function clusterReducer(
  state = { lastUpdated: 0, isFetching: false, items: {} },
  action = undefined
) {
  var items;

  switch (action.type) {
    case types.CLUSTERS_LOAD_SUCCESS:
      items = {};

      _.each(action.clusters, cluster => {
        items[cluster.id] = Object.assign(
          {},
          items[cluster.id],
          ensureMetricKeysAreAvailable(cluster)
        );

        // Guard against API that returns null for certain values when they are
        // empty.
        items[cluster.id].nodes = items[cluster.id].nodes || [];
        items[cluster.id].keyPairs = items[cluster.id].keyPairs || [];
        items[cluster.id].scaling = items[cluster.id].scaling || {};
      });

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items,
      };

    case types.CLUSTERS_LOAD_ERROR:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        errorLoading: true,
        items: items,
      };

    case types.CLUSTER_LOAD_DETAILS_SUCCESS:
      items = Object.assign({}, state.items);

      items[action.cluster.id] = Object.assign(
        {},
        items[action.cluster.id],
        action.cluster
      );

      items[action.cluster.id] = Object.assign(
        {},
        items[action.cluster.id],
        ensureWorkersHaveAWSkey(action.cluster)
      );

      // Fill in scaling values when they aren't supplied.
      if (
        items[action.cluster.id].scaling.min === undefined &&
        items[action.cluster.id].scaling.max === undefined
      ) {
        items[action.cluster.id].scaling.min =
          items[action.cluster.id].workers.length;
        items[action.cluster.id].scaling.max =
          items[action.cluster.id].workers.length;
      }

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items,
      };

    case types.CLUSTER_LOAD_DETAILS_ERROR:
      items = Object.assign({}, state.items);

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        errorLoading: true,
      });

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items,
      };

    case types.CLUSTER_LOAD_STATUS_SUCCESS:
      items = Object.assign({}, state.items);

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        status: action.status,
      });

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items,
      };

    case types.CLUSTER_LOAD_STATUS_NOT_FOUND:
      items = Object.assign({}, state.items);

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        status: null,
      });

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items,
      };

    case types.CLUSTER_LOAD_STATUS_ERROR:
      items = Object.assign({}, state.items);

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        errorLoading: true,
      });

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items,
      };

    case types.CLUSTER_LOAD_KEY_PAIRS:
      items = Object.assign({}, state.items);

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        isFetchingKeyPairs: true,
      });

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items,
      };

    case types.CLUSTER_LOAD_KEY_PAIRS_SUCCESS:
      items = Object.assign({}, state.items);

      // Add expire_date to keyPairs based on ttl_hours
      var keyPairs = Object.entries(action.keyPairs).map(([, keyPair]) => {
        keyPair.expire_date = moment(keyPair.create_date)
          .utc()
          .add(keyPair.ttl_hours, 'hours');
        return keyPair;
      });

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        isFetchingKeyPairs: false,
        keyPairs: keyPairs,
      });

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items,
      };

    case types.CLUSTER_LOAD_KEY_PAIRS_ERROR:
      items = Object.assign({}, state.items);

      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        isFetchingKeyPairs: false,
      });

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items,
      };

    case types.CLUSTER_DELETE_SUCCESS:
      items = Object.assign({}, state.items);

      delete items[action.clusterId];

      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: items,
      };

    default:
      return state;
  }
}
