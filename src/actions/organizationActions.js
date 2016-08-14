"use strict";

import * as types from './actionTypes';

import GiantSwarm from '../lib/giantswarm_client_wrapper';

var giantSwarm = new GiantSwarm.Client();

export function organizationDelete(orgId) {
  return {type: types.ORGANIZATION_DELETE, orgId};
}

export function organizationDeleteConfirm(orgId) {
  return function(dispatch) {
    return giantSwarm.organizationDelete(orgId).then(response => {
      dispatch(organizationDelete(orgId));
    }).catch(error => {
      throw(error);
    });
  };
}

export function organizationsLoadSuccess(organizations) {
  return {type: types.ORGANIZATIONS_LOAD_SUCCESS, organizations};
}

export function organizationsLoad() {
  return function(dispatch) {
    return giantSwarm.memberships().then(response => {
      dispatch(organizationsLoadSuccess(response.result));
    }).catch(error => {
      throw(error);
    });
  };
}