'use strict';

import * as types from './actionTypes';
import GiantSwarm from '../lib/giantswarm_client_wrapper';

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
      dispatch(clusterLoadDetailsError(error));
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