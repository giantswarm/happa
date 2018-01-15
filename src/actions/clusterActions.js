'use strict';

import * as types from './actionTypes';
import GiantSwarm from '../lib/giantswarm_client_wrapper';
import { modalHide } from './modalActions';
import { flashAdd } from './flashMessageActions';
import React from 'react';
import { browserHistory } from 'react-router';


// clusterSelect
// =============================================================
// Sets which cluster is in "focus". For pages that reference a
// specific cluster, the "focused" cluster will be used.
//
// The only page that really cares about that right now is the
// configure page in the getting started guide.
//

export function clusterSelect(clusterId) {
  return function(dispatch) {
    return dispatch({
      type: types.CLUSTER_SELECT,
      clusterId
    });
  };
}

// clusterLoadDetails
// =============================================================
// Takes a clusterId and loads details for that cluster

export function clusterLoadDetailsSuccess(cluster) {
  return {
    type: types.CLUSTER_LOAD_DETAILS_SUCCESS,
    cluster
  };
}

export function clusterLoadDetailsError(error) {
  return {
    type: types.CLUSTER_LOAD_DETAILS_ERROR,
    error
  };
}

export function clusterLoadMetrics(clusterId) {
  return {
    type: types.CLUSTER_LOAD_METRICS,
    clusterId
  };
}

export function clusterLoadMetricsSuccess(clusterId, metrics) {
  return {
    type: types.CLUSTER_LOAD_METRICS_SUCCESS,
    clusterId,
    metrics
  };
}

export function clusterLoadMetricsError(clusterId, error) {
  return {
    type: types.CLUSTER_LOAD_METRICS_ERROR,
    clusterId,
    error
  };
}

export function clusterDelete(cluster) {
  return {
    type: types.CLUSTER_DELETE,
    cluster
  };
}

export function clusterDeleteConfirm(cluster) {
  return function(dispatch, getState) {
    dispatch({
      type: types.CLUSTER_DELETE_CONFIRM,
      cluster
    });

    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.deleteCluster({clusterId: cluster.id})
    .then(() => {
      browserHistory.push('/organizations/'+cluster.owner);
      dispatch(clusterDeleteSuccess(cluster.id));

      dispatch(modalHide());
      dispatch(flashAdd({
        message: <div>Cluster &lsquo;{cluster.id}&lsquo; deleted succesfully</div>,
        class: 'success',
        ttl: 3000
      }));
    })
    .catch((error) => {
      dispatch(modalHide());
      dispatch(flashAdd({
        message: <div>Something went wrong while trying to delete cluster: {cluster.id}<br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}</div>,
        class: 'danger',
        ttl: 3000
      }));

      console.error(error);
      return dispatch(clusterDeleteError(cluster.id, error));
    });
  };
}

export function clusterDeleteSuccess(clusterId) {
  return {
    type: types.CLUSTER_DELETE_SUCCESS,
    clusterId
  };
}

export function clusterDeleteError(clusterId, error) {
  return {
    type: types.CLUSTER_DELETE_ERROR,
    clusterId,
    error
  };
}

export function clusterLoadDetails(clusterId) {
  return function(dispatch, getState) {
    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.clusterDetails({clusterId})
    .then((response) => {
      var cluster = response.result;
      dispatch(clusterLoadDetailsSuccess(cluster));
      return cluster;
    })
    .catch((error) => {
      dispatch(clusterLoadDetailsError(clusterId, error));
    });
  };
}

export function clusterLoadKeyPairs(clusterId) {
  return function(dispatch, getState) {
    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    dispatch({
      type: types.CLUSTER_LOAD_KEY_PAIRS,
      clusterId
    });

    return giantSwarm.clusterKeyPairs({clusterId})
    .then((response) => {
      dispatch({
        type: types.CLUSTER_LOAD_KEY_PAIRS_SUCCESS,
        clusterId,
        keyPairs: response.result
      });
    })
    .catch((error) => {
      dispatch({
        type: types.CLUSTER_LOAD_KEY_PAIRS_ERROR,
        clusterId
      });

      throw(error);
    });
  };
}

export function clusterLoadSuccess(clusters) {
  return {
    type: types.CLUSTER_LOAD_SUCCESS,
    clusters: clusters
  };
}


export function clusterLoadError(error) {
  return {
    type: types.CLUSTER_LOAD_ERROR,
    error: error
  };
}
