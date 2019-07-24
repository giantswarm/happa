import * as types from 'actions/actionTypes';
import _ from 'underscore';
import moment from 'moment';

/**
 * Since the API omits the 'aws' key from workers on kvm installations, I will
 * add it back here with dummy values if it is not present.
 *
 * @param {Object} clusterDetails Cluster object
 */
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
  state = { lastUpdated: null, isFetching: false, items: {} },
  action = undefined
) {
  let items = { ...state.items };

  switch (action.type) {
    case types.CLUSTERS_LOAD_SUCCESS:
      // if state was populated previously, let new data overwrite old data partially
      var prevClusterIDs = Object.keys(state.items).sort();

      // use existing state's items and update it

      var newClusterIDs = _.map(_.toArray(action.clusters), item => {
        return item.id;
      }).sort();

      // account for deleted clusters
      var deleted = _.difference(prevClusterIDs, newClusterIDs);
      deleted.forEach(deletedClusterID => {
        delete items[deletedClusterID];
      });

      _.each(action.clusters, cluster => {
        items[cluster.id] = Object.assign({}, items[cluster.id], cluster);

        items[cluster.id].lastUpdated = Date.now();

        // Guard against API that returns null for certain values when they are
        // empty.
        items[cluster.id].nodes = items[cluster.id].nodes || [];
        items[cluster.id].keyPairs = items[cluster.id].keyPairs || [];
        items[cluster.id].scaling = items[cluster.id].scaling || {};
      });

      return {
        ...state,
        lastUpdated: Date.now(),
        items,
      };

    case types.CLUSTERS_LOAD_ERROR:
      return {
        ...state,
        errorLoading: true,
        items,
      };

    case types.CLUSTER_LOAD_DETAILS_SUCCESS:
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
        ...state,
        items,
      };

    case types.CLUSTER_LOAD_DETAILS_ERROR:
      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        errorLoading: true,
      });

      return {
        ...state,
        items,
      };

    case types.CLUSTER_LOAD_STATUS_SUCCESS:
      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        status: action.status,
      });

      items[action.clusterId].status.lastUpdated = Date.now();

      return {
        ...state,
        items,
      };

    case types.CLUSTER_LOAD_STATUS_NOT_FOUND:
      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        status: null,
      });

      return {
        ...state,
        items,
      };

    case types.CLUSTER_LOAD_STATUS_ERROR:
      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        errorLoading: true,
      });

      return {
        ...state,
        items,
      };

    case types.CLUSTER_LOAD_APPS:
      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        isFetchingApps: true,
      });

      return {
        ...state,
        lastUpdated: Date.now(),
        items,
      };

    case types.CLUSTER_LOAD_APPS_SUCCESS:
      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        isFetchingApps: false,

        // For some reason the array that we get back
        // from the generated js client does not have
        // .map on it. So I make a new one here.
        apps: Array(...action.apps),
      });

      return {
        ...state,
        lastUpdated: Date.now(),
        items,
      };

    case types.CLUSTER_LOAD_APPS_ERROR:
      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        isFetchingApps: false,
      });

      return {
        ...state,
        lastUpdated: Date.now(),
        items,
      };

    case types.CLUSTER_LOAD_KEY_PAIRS:
      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        isFetchingKeyPairs: true,
      });

      return {
        ...state,
        items,
      };

    case types.CLUSTER_LOAD_KEY_PAIRS_SUCCESS:
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
        ...state,
        items,
      };

    case types.CLUSTER_LOAD_KEY_PAIRS_ERROR:
      items[action.clusterId] = Object.assign({}, items[action.clusterId], {
        isFetchingKeyPairs: false,
      });

      return {
        ...state,
        items,
      };

    case types.CLUSTER_DELETE_SUCCESS:
      delete items[action.clusterId];

      return {
        ...state,
        lastUpdated: Date.now(),
        items,
      };

    default:
      return state;
  }
}
