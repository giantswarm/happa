"use strict";

import * as types from './actionTypes';
import _ from 'underscore';
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
    .then(membershipsResponse => {
      var organizationsArray = membershipsResponse.result;

      var clusters = Promise.all(_.map(organizationsArray, organizationName => {
        return giantSwarm.clusters({ organizationName })
               .then(response => {
                 return [organizationName, response.result.clusters] || [organizationName, []];
               });
      }));

      var orgDetails = Promise.all(_.map(organizationsArray, organizationName => {
        return giantSwarm.organization({ organizationName })
               .then(response => {
                 return [organizationName, response.result];
               });
      }));

      return Promise.all([clusters, orgDetails]);
    })
    .then((result) => {
      var clusters = result[0];
      var orgDetails = result[1];

      var organizations = clusters.reduce((previous, current) => {
        var orgId = current[0];
        var clusters = current[1];
        previous[orgId] = {clusters: clusters.map((x) => {return x.id;})};
        return previous;
      }, {});

      organizations = orgDetails.reduce((previous, current) => {
        var orgId = current[0];
        var orgDetails = current[1];
        previous[orgId] = Object.assign({}, previous[orgId], orgDetails);
        return previous;
      }, organizations);

      return organizations;
    })
    .then((organizations) => {
      var result = {
        lastUpdated: 12345678,
        isFetching: false,
        items: organizations
      };

      dispatch(organizationsLoadSuccess(result));
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
      class: "success"
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
      class: "success"
    })))
    .catch(error => {
      throw(error);
    });
  };
}