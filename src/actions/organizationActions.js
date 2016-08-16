"use strict";

import * as types from './actionTypes';
import _ from 'underscore';
import GiantSwarm from '../lib/giantswarm_client_wrapper';
import {modalHide} from './modalActions';
import {flashAdd} from './flashMessageActions';
import React from 'react';

var giantSwarm = new GiantSwarm.Client();

export function organizationsLoadSuccess(organizations) {
  return {
    type: types.ORGANIZATIONS_LOAD_SUCCESS,
    organizations
  };
}

export function organizationsLoad() {
  return function(dispatch) {
    dispatch({type: types.ORGANIZATIONS_LOAD});

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
        var clusters = current[1] || [];
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
      dispatch(organizationsLoadSuccess(organizations));
    })
    .catch(error => {
      dispatch(flashAdd({
        message: <div><strong>Something went wrong while trying to load the list of organizations</strong><br/>{error.body ? error.body.status_text : "Perhaps our servers are down, please try again later or contact support: info@giantswarm.io"}</div>,
        class: "danger"
      }));

      dispatch({
        type: types.ORGANIZATIONS_LOAD_ERROR
      });
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
      ttl: 3000
    })))
    .catch(error => {
      dispatch(modalHide());

      dispatch(flashAdd({
        message: <div><strong>Could not delete organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : "Perhaps our servers are down, please try again later or contact support: info@giantswarm.io"}</div>,
        class: "danger"
      }));

      dispatch({
        type: types.ORGANIZATION_DELETE_ERROR
      });
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
    dispatch({type: types.ORGANIZATION_CREATE_CONFIRM});

    return giantSwarm.createOrganization({
      organizationName: orgId
    })
    .then(organizationsLoad().bind(this, dispatch))
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully created organization: ' + orgId,
      class: "success",
      ttl: 3000
    })))
    .catch(error => {
      dispatch(modalHide());

      dispatch(flashAdd({
        message: <div><strong>Could not create organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : "Perhaps our servers are down, please try again later or contact support: info@giantswarm.io"}</div>,
        class: "danger"
      }));

      dispatch({
        type: types.ORGANIZATION_CREATE_ERROR
      });
    });
  };
}

export function organizationAddMember(orgId) {
  return {
    type: types.ORGANIZATION_ADD_MEMBER,
    orgId: orgId
  };
}

export function organizationAddMemberConfirm(orgId, username) {
  return function(dispatch) {
    return giantSwarm.addMemberToOrganization({
      organizationName: orgId,
      username: username
    })
    .then(organizationsLoad().bind(this, dispatch))
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully added `' + username + '` to organization: ' + '`' + orgId + '`',
      class: "success",
      ttl: 3000
    })))
    .catch(error => {
      dispatch(modalHide());

      dispatch(flashAdd({
        message: <div><strong>Could not add user `{username}` to organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : "Perhaps our servers are down, please try again later or contact support: info@giantswarm.io"}</div>,
        class: "danger"
      }));

      dispatch({
        type: types.ORGANIZATION_ADD_MEMBER_ERROR
      });
    });
  };
}


export function organizationRemoveMemberConfirm(orgId, username) {
  return function(dispatch) {
    return giantSwarm.removeMemberFromOrganization({
      organizationName: orgId,
      username: username
    })
    .then(organizationsLoad().bind(this, dispatch))
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully removed `' + username + '` to organization: ' + '`' + orgId + '`',
      class: "success",
      ttl: 3000
    })))
    .catch(error => {
      dispatch(modalHide());

      dispatch(flashAdd({
        message: <div><strong>Could not remove user `{username}`` from organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : "Perhaps our servers are down, please try again later or contact support: info@giantswarm.io"}</div>,
        class: "danger"
      }));

      dispatch({
        type: types.ORGANIZATION_REMOVE_MEMBER_ERROR
      });
    });
  };
}

export function organizationRemoveMember(orgId, username) {
  return {
    type: types.ORGANIZATION_REMOVE_MEMBER,
    orgId: orgId,
    username: username
  };
}
