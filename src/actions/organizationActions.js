"use strict";

import * as types from './actionTypes';

import GiantSwarm from '../lib/giantswarm_client_wrapper';
import {modalHide} from './modalActions';
import {flashAdd} from './flashMessageActions';

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
      dispatch(organizationsLoadSuccess(response.result));
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
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully deleted organization: ' + orgId,
      class: "success",
      key: "delete"
    })))
    .catch(error => {
      throw(error);
    });
  };
}

export function organizationDelete(orgId) {
  return {
    type: types.ORGANIZATION_DELETE,
    orgId: orgId
  };
}

export function organizationCreate() {
  return {
    type: types.ORGANIZATION_CREATE
  };
}

export function organizationCreateConfirm(orgId) {
  return function(dispatch) {
    return giantSwarm.createOrganization({
      organizationName: orgId
    })
    .then(organizationsLoad().bind(this, dispatch))
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully created organization: ' + orgId,
      class: "success",
      key: "create"
    })))
    .catch(error => {
      throw(error);
    });
  };
}