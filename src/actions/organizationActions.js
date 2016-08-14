"use strict";

import * as types from './actionTypes';

import GiantSwarm from '../lib/giantswarm_client_wrapper';
import {modalHide} from './modalActions';

var giantSwarm = new GiantSwarm.Client();

export function organizationsLoadSuccess(organizations) {
  return {
    type: types.ORGANIZATIONS_LOAD_SUCCESS,
    organizations
  };
}

export function organizationsLoad() {
  return function(dispatch) {
    return giantSwarm.memberships()
    .then(response => {
      dispatch(organizationsLoadSuccess(response.result))
    })
    .catch(error => {
      throw(error);
    });
  };
}

export function organizationDeleteConfirm(orgId) {
  return function(dispatch) {
    return giantSwarm.deleteOrganization({
      organizationName: orgId
    })
    .then(organizationsLoad().bind(this, dispatch))
    .then(dispatch.bind(this, modalHide()))
    .catch(error => {
      throw(error);
    });
  };
}

export function organizationDelete(orgId) {
  return {
    type: types.ORGANIZATION_DELETE,
    orgId: orgId,
    confirmAction: organizationDeleteConfirm(orgId)
  };
}



