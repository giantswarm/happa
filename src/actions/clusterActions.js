'use strict';

import * as types from './actionTypes';
import GiantSwarm from '../lib/giantswarm_client_wrapper';
import Desmotes from '../lib/desmotes_client';

// clusterLoadDetailsForOrganization
// =============================================================
// Takes an organization name and loads details for all clusters
// associated with that organization.

export function clusterLoadDetailsForOrganizationSuccess() {
}

export function clusterLoadDetailsForOrganizationError() {
}

export function clusterLoadDetailsForOrganization(organizationId) {
  return function(dispatch, getState) {
  };
}

// clusterSelect
// =============================================================
// Sets which cluster is in "focus". For pages that reference a
// specific cluster, the "focused" cluster will be used.
//
// The only page that really cares about that right now is the
// configure page in the getting started guide.
//

export function clusterSelect(clusterId) {
  return function(dispatch, getState) {
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
      throw(error);
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

    return desmotes.clusterMetrics({
      clusterId: clusterId
    }).then((metrics) => {
      dispatch(clusterLoadMetricsSuccess(clusterId, metrics));
    })
    .catch((error) => {
      dispatch(clusterLoadMetricsError(clusterId, error));
      throw(error);
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