'use strict';

import * as types from './actionTypes';
import GiantSwarm from '../lib/giantswarm_client_wrapper';
import Desmotes from '../lib/desmotes_client';
import { modalHide } from './modalActions';
import { flashAdd } from './flashMessageActions';
import React from 'react';


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

export function clusterDelete(clusterId) {
  return {
    type: types.CLUSTER_DELETE,
    clusterId
  };
}

export function clusterDeleteConfirm(clusterId) {
  return function(dispatch, getState) {
    dispatch({
      type: types.CLUSTER_DELETE_CONFIRM,
      clusterId
    });

    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.deleteCluster({clusterId})
    .then((response) => {
      dispatch(modalHide());
      dispatch(flashAdd({
        message: <div><strong>Cluster deleted succesfully</strong></div>,
        class: 'success'
      }));
      dispatch(clusterDeleteSuccess(clusterId));
    })
    .catch((error) => {
      dispatch(modalHide());
      dispatch(flashAdd({
        message: <div><strong>Something went wrong while trying to delete cluster: {clusterId}</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: info@giantswarm.io'}</div>,
        class: 'danger'
      }));
      dispatch(clusterDeleteError(clusterId, error));
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

export function clusterFetchMetrics(clusterId) {
  return function(dispatch, getState) {
    var authToken = getState().app.loggedInUser.authToken;

    var desmotes = new Desmotes({
      endpoint: window.config.desmotesEndpoint,
      authorizationToken: authToken
    });

    dispatch(clusterLoadMetrics(clusterId));

    return desmotes.clusterMetrics({
      clusterId: clusterId
    }).then((metrics) => {
      dispatch(clusterLoadMetricsSuccess(clusterId, metrics));
    })
    .catch((error) => {
      dispatch(clusterLoadMetricsError(clusterId, error));
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
    .catch(() => {
      dispatch({
        type: types.CLUSTER_LOAD_KEY_PAIRS_ERROR,
        clusterId
      });
    });
  };
}


// clusterLoadPartialDetails
// =================================================================
// Since organization load also includes some cluster details
// it will fire off the CLUSTER_LOAD_PARTIAL_DETAILS action
// with that cluster data so it can end up in entities.clusters

export function clusterLoadPartialDetails(cluster) {
  return {
    type: types.CLUSTER_LOAD_PARTIAL_DETAILS,
    cluster: cluster
  };
}