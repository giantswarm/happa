'use strict';

import * as types from './actionTypes';
import _ from 'underscore';
import GiantSwarm from '../lib/giantswarm_client_wrapper';
import DomainValidator from '../lib/domain_validator_client';
import { modalHide } from './modalActions';
import { flashAdd } from './flashMessageActions';
import { clusterLoadSuccess, clusterLoadError } from './clusterActions';
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

export function organizationDeleteSuccess(orgId) {
  return {
    type: types.ORGANIZATION_DELETE_SUCCESS,
    orgId
  };

}

export function organizationsLoadSuccess(organizations) {
  return {
    type: types.ORGANIZATIONS_LOAD_SUCCESS,
    organizations
  };
}

// organizationsLoad
// -----------------
// This long function does various requests to the Giant Swarm API
// and massages the responses into some reasonable state for Happa to
// work with.
//
export function organizationsLoad() {
  return function(dispatch, getState) {
    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    var alreadyFetching = getState().entities.organizations.isFetching;

    if (alreadyFetching) {
      return new Promise((resolve) => { resolve(); });
    }

    dispatch({type: types.ORGANIZATIONS_LOAD});

    return giantSwarm.memberships()
    .then(membershipsResponse => {
      var organizationsArray = membershipsResponse.result;

      var clusters = giantSwarm.clusters()
                     .then(response => {
                        dispatch(clusterLoadSuccess(response.result));
                     })
                     .catch((error) => {
                        console.error(error);
                        dispatch(clusterLoadError(error));
                     });

      var orgDetails = Promise.all(_.map(organizationsArray, organizationName => {
        return giantSwarm.organization({ organizationName })
               .then(response => {
                 return response.result;
               });
      }));

      return Promise.all([clusters, orgDetails]);
    })
    .then((result) => {
      var orgDetails = result[1];

      var organizations = orgDetails.reduce((previous, current) => {
        var orgId = current.id;
        var orgDetails = current;

        orgDetails.members = orgDetails.members.sort();

        previous[orgId] = Object.assign(
          {},
          {clusters: []},
          getState().entities.organizations.items[orgId],
          orgDetails,
        );
        return previous;
      }, {});

      return organizations;
    })
    .then((organizations) => {
      dispatch(organizationsLoadSuccess(organizations));
      return null;
    })
    .catch(error => {
      console.error(error);
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
    .then(() => {return dispatch(organizationDeleteSuccess(orgId));})
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

export function organizationAddMemberConfirm(orgId, email) {
  return function(dispatch, getState) {
    dispatch({
      type: types.ORGANIZATION_ADD_MEMBER_CONFIRM,
      orgId: orgId,
      email: email
    });

    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.addMemberToOrganization({
      organizationName: orgId,
      email: email
    })
    .then(() => {return dispatch(organizationsLoad());})
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully added `' + email + '` to organization: ' + '`' + orgId + '`',
      class: 'success',
      ttl: 3000
    })))
    .catch(error => {
      dispatch(modalHide());

      dispatch(flashAdd({
        message: <div><strong>Could not add user `{email}` to organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: info@giantswarm.io'}</div>,
        class: 'danger'
      }));

      dispatch({
        type: types.ORGANIZATION_ADD_MEMBER_ERROR
      });
    });
  };
}


export function organizationRemoveMemberConfirm(orgId, email) {
  return function(dispatch, getState) {
    dispatch({
      type: types.ORGANIZATION_REMOVE_MEMBER_CONFIRM,
      orgId: orgId,
      email: email
    });

    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.removeMemberFromOrganization({
      organizationName: orgId,
      email: email
    })
    .then(() => {return dispatch(organizationsLoad());})
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully removed `' + email + '` from organization: ' + '`' + orgId + '`',
      class: 'success',
      ttl: 3000
    })))
    .catch(error => {
      dispatch(modalHide());

      dispatch(flashAdd({
        message: <div><strong>Could not remove user `{email}` from organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: info@giantswarm.io'}</div>,
        class: 'danger'
      }));

      dispatch({
        type: types.ORGANIZATION_REMOVE_MEMBER_ERROR
      });
    });
  };
}

export function organizationRemoveMember(orgId, email) {
  return {
    type: types.ORGANIZATION_REMOVE_MEMBER,
    orgId: orgId,
    email: email
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
