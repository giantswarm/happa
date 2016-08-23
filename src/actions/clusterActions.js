'use strict';

import * as types from './actionTypes';

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
  }
}

// clusterLoadDetails
// =============================================================
// Takes a clusterId and loads details for that cluster

export function clusterLoadDetailsSuccess() {
}

export function clusterLoadDetailsError() {
}

export function clusterLoadDetails(clusterId) {
  return function(dispatch, getState) {
  }
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
  }
}