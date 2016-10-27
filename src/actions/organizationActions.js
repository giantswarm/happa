'use strict';

import * as types from './actionTypes';
import _ from 'underscore';
import GiantSwarm from '../lib/giantswarm_client_wrapper';
import DomainValidator from '../lib/domain_validator_client';
import { modalHide } from './modalActions';
import { flashAdd } from './flashMessageActions';
import { clusterLoadPartialDetails } from './clusterActions';
import React from 'react';
import { browserHistory } from 'react-router';

export function organizationSelect(orgId) {
  return function(dispatch, getState) {

    browserHistory.push('/');

    return dispatch({
      type: types.ORGANIZATION_SELECT,
      orgId,
      organizations: getState().entities.organizations.items
    });
  };
}

export function organizationDeleteSuccess(orgId, deletingSelectedOrganization) {
  // Check if the organization the user deleted is the currently selected organization
  // If so, switch to the first organization in the list.
  //
  // Don't switch if there are no organizations at all.
  return function(dispatch, getState) {
    var firstOrganization = _.map(_.sortBy(getState().entities.organizations.items, 'id'), (x) => {return x.id;})[0];

    if (firstOrganization && deletingSelectedOrganization) {
      return dispatch(organizationSelect(firstOrganization));
    }

    return null;
  };
}

export function organizationsLoadSuccess(organizations) {
  return {
    type: types.ORGANIZATIONS_LOAD_SUCCESS,
    organizations
  };
}

export function organizationsLoad() {
  return function(dispatch, getState) {
    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    var alreadyFetching = getState().entities.organizations.isFetching;

    if (alreadyFetching) {
      return null;
    }

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
        previous[orgId] = {clusters: clusters.sort().map((x) => {return x.id;})};

        _.each(clusters, (cluster) => {
          dispatch(clusterLoadPartialDetails(cluster));
        });

        return previous;
      }, {});

      organizations = orgDetails.reduce((previous, current) => {
        var orgId = current[0];
        var orgDetails = current[1];
        orgDetails.members = orgDetails.members.sort();
        previous[orgId] = Object.assign({}, previous[orgId], orgDetails);
        return previous;
      }, organizations);

      return organizations;
    })
    .then((organizations) => {
      dispatch(organizationsLoadSuccess(organizations));
      return null;
    })
    .catch(error => {
      dispatch(flashAdd({
        message: <div><strong>Something went wrong while trying to load the list of organizations</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: info@giantswarm.io'}</div>,
        class: 'danger'
      }));

      dispatch({
        type: types.ORGANIZATIONS_LOAD_ERROR
      });
    });
  };
}

export function organizationDeleteConfirm(orgId) {
  return function(dispatch, getState) {
    dispatch({type: types.ORGANIZATION_DELETE_CONFIRM, orgId: orgId});

    var deletingSelectedOrganization = orgId === getState().app.selectedOrganization;

    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.deleteOrganization({
      organizationName: orgId
    })
    .then(() => {return dispatch(organizationsLoad());})
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully deleted organization: ' + orgId,
      class: 'success',
      ttl: 3000
    })))
    .then(() => {return dispatch(organizationDeleteSuccess(orgId, deletingSelectedOrganization));})
    .catch(error => {
      dispatch(modalHide());

      dispatch(flashAdd({
        message: <div><strong>Could not delete organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: info@giantswarm.io'}</div>,
        class: 'danger'
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
  return function(dispatch, getState) {
    dispatch({type: types.ORGANIZATION_CREATE_CONFIRM});

    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.createOrganization({
      organizationName: orgId
    })
    .then(() => {return dispatch(organizationsLoad());})
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully created organization: ' + orgId,
      class: 'success',
      ttl: 3000
    })))
    .catch(error => {
      dispatch(modalHide());

      dispatch(flashAdd({
        message: <div><strong>Could not create organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: info@giantswarm.io'}</div>,
        class: 'danger'
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
  return function(dispatch, getState) {
    dispatch({
      type: types.ORGANIZATION_ADD_MEMBER_CONFIRM,
      orgId: orgId,
      username: username
    });

    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.addMemberToOrganization({
      organizationName: orgId,
      username: username
    })
    .then(() => {return dispatch(organizationsLoad());})
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully added `' + username + '` to organization: ' + '`' + orgId + '`',
      class: 'success',
      ttl: 3000
    })))
    .catch(error => {
      dispatch(modalHide());

      dispatch(flashAdd({
        message: <div><strong>Could not add user `{username}` to organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: info@giantswarm.io'}</div>,
        class: 'danger'
      }));

      dispatch({
        type: types.ORGANIZATION_ADD_MEMBER_ERROR
      });
    });
  };
}


export function organizationRemoveMemberConfirm(orgId, username) {
  return function(dispatch, getState) {
    dispatch({
      type: types.ORGANIZATION_REMOVE_MEMBER_CONFIRM,
      orgId: orgId,
      username: username
    });

    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.removeMemberFromOrganization({
      organizationName: orgId,
      username: username
    })
    .then(() => {return dispatch(organizationsLoad());})
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully removed `' + username + '` from organization: ' + '`' + orgId + '`',
      class: 'success',
      ttl: 3000
    })))
    .catch(error => {
      dispatch(modalHide());

      dispatch(flashAdd({
        message: <div><strong>Could not remove user `{username}`` from organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: info@giantswarm.io'}</div>,
        class: 'danger'
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

export function organizationLoadDomains(organizationId) {
  return function(dispatch, getState) {
    var domainValidator = new DomainValidator({
     endpoint: window.config.domainValidatorEndpoint,
     authorizationToken: getState().app.loggedInUser.authToken,
    });

    return domainValidator.domains({ organizationId })
    .then(response => {
      dispatch({
        type: types.ORGANIZATION_LOAD_DOMAINS,
        organizationId,
        domains: response
      });
    })
    .catch(error => {
      throw error;
    });
  };
}

export function organizationAddDomain(organizationId, domain) {
  return function(dispatch, getState) {
    var domainValidator = new DomainValidator({
     endpoint: window.config.domainValidatorEndpoint,
     authorizationToken: getState().app.loggedInUser.authToken,
    });

    return domainValidator.addDomain({ organizationId, domain })
    .then(response => {
      dispatch({
        type: types.ORGANIZATION_ADD_DOMAIN,
        organizationId,
        domain: response
      });

      return response;
    })
    .catch(error => {
      throw error;
    });
  };
}

export function organizationDeleteDomain(organizationId, domain) {
  return function(dispatch, getState) {
    var domainValidator = new DomainValidator({
     endpoint: window.config.domainValidatorEndpoint,
     authorizationToken: getState().app.loggedInUser.authToken,
    });

    return domainValidator.deleteDomain({ organizationId, domain })
    .then(response => {
      dispatch({
        type: types.ORGANIZATION_DELETE_DOMAIN,
        organizationId,
        domain: response
      });
    })
    .catch(error => {
      throw error;
    });
  };
}