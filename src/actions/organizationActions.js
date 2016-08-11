"use strict";

import * as types from './actionTypes';

import GiantSwarm from '../lib/giantswarm_client_wrapper';

var giantSwarm = new GiantSwarm.Client();


export function loadOrganizationsSuccess(organizations) {
  return {type: types.LOAD_ORGANIZATIONS_SUCCESS, organizations};
}

export function loadOrganizations() {
  return function(dispatch) {
    return giantSwarm.memberships().then(response => {
      dispatch(loadOrganizationsSuccess(response.result));
    }).catch(error => {
      throw(error);
    });
  };
}