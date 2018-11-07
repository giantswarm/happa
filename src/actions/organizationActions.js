'use strict';

import * as types from './actionTypes';
import _ from 'underscore';
import { modalHide } from './modalActions';
import { flashAdd } from './flashMessageActions';
import { clusterLoadSuccess, clusterLoadError } from './clusterActions';
import React from 'react';
import GiantSwarmV4 from 'giantswarm-v4';
import { push } from 'connected-react-router';

// determineSelectedOrganization takes a list of organizations and looks into
// localstorage to see what the user had selected already (if anything) as their
// selected organization.
//
// Using this information, it ensures we always have a valid organization selected.
var determineSelectedOrganization = function(organizations) {
  var allOrganizations = _.map(organizations, x => x.id);
  var previouslySelectedOrganization = localStorage.getItem('app.selectedOrganization');
  var organizationStillExists = allOrganizations.indexOf(previouslySelectedOrganization) > -1;
  var selectedOrganization;

  if (previouslySelectedOrganization && organizationStillExists) {
    // The user had an organization selected, and it still exists.
    // So we stay on it.
    selectedOrganization = previouslySelectedOrganization;

  } else {
    // The user didn't have an organization selected yet, or the one
    // they selected is gone. Switch to the first organization in the list.
    var firstOrganization = _.map(organizations, (x) => {return x.id;})[0];
    localStorage.setItem('app.selectedOrganization', firstOrganization);

    selectedOrganization = firstOrganization;
  }

  return selectedOrganization;
};

// determineSelectedCluster takes a list of clusters and an organization and looks into
// localstorage to see what the user had selected already (if anything) as their
// selected cluster.
//
// Using this information, it ensures we always have a valid cluster selected.
var determineSelectedCluster = function(selectedOrganization, clusters) {
  var previouslySelectedCluster = localStorage.getItem('app.selectedCluster');
  var orgClusters = _.filter(clusters, cluster => cluster.owner === selectedOrganization);

  var clusterStillExists = _.map(orgClusters, x => x.id).indexOf(previouslySelectedCluster) > -1;
  var selectedCluster;

  if (previouslySelectedCluster && clusterStillExists) {
    selectedCluster = previouslySelectedCluster;
  } else {
    if (orgClusters.length > 0) {
      selectedCluster = orgClusters[0].id;
    } else {
      selectedCluster = undefined;
    }
    localStorage.setItem('app.selectedCluster', selectedCluster);
  }

  return selectedCluster;
};

// organizationSelect sets the organization that the user is focusing on and
// stores it in localstorage so that it persists when the users comes back
// after closing the browser window.
//
// It also ensures we have a valid cluster selected.
export function organizationSelect(orgId) {
  return function(dispatch, getState) {

    localStorage.setItem('app.selectedOrganization', orgId);

    // We're changing to a different organization
    // Make sure we have a reasonable value for selectedCluster.
    var selectedCluster = determineSelectedCluster(orgId, getState().entities.clusters.items);

    dispatch(push('/'));

    return dispatch({
      type: types.ORGANIZATION_SELECT,
      orgId,
      selectedCluster
    });
  };
}

export function organizationDeleteSuccess(orgId) {
  return {
    type: types.ORGANIZATION_DELETE_SUCCESS,
    orgId
  };

}

export function organizationsLoadSuccess(organizations, selectedOrganization, selectedCluster) {
  return {
    type: types.ORGANIZATIONS_LOAD_SUCCESS,
    organizations,
    selectedOrganization,
    selectedCluster
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
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    var clustersApi = new GiantSwarmV4.ClustersApi();
    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    var alreadyFetching = getState().entities.organizations.isFetching;

    if (alreadyFetching) {
      return new Promise((resolve) => { resolve(); });
    }

    dispatch({type: types.ORGANIZATIONS_LOAD});

    return organizationsApi.getOrganizations(scheme + ' ' + token)
    .then(organizations => {
      var organizationsArray = organizations.map((organization) => {
        return organization.id;
      });

      var clusters = clustersApi.getClusters(scheme + ' ' + token)
                     .then(data => {
                        dispatch(clusterLoadSuccess(data));
                        return data;
                     })
                     .catch((error) => {
                        console.error(error);
                        dispatch(clusterLoadError(error));
                     });

      var orgDetails = Promise.all(_.map(organizationsArray, organizationName => {
        return organizationsApi.getOrganization(scheme + ' ' + token, organizationName)
               .then(organization => {
                 return organization;
               });
      }));

      return Promise.all([clusters, orgDetails]);
    })
    .then((result) => {
      var clusters = result[0];
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

      var selectedOrganization = determineSelectedOrganization(organizations);
      var selectedCluster = determineSelectedCluster(selectedOrganization, clusters);

      return {
        organizations,
        selectedOrganization,
        selectedCluster
      };
    })
    .then((result) => {
      dispatch(organizationsLoadSuccess(result.organizations, result.selectedOrganization, result.selectedCluster));
      return null;
    })
    .catch(error => {
      console.error(error);
      dispatch(flashAdd({
        message: <div><strong>Something went wrong while trying to load the list of organizations</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}</div>,
        class: 'danger'
      }));

      dispatch({
        type: types.ORGANIZATIONS_LOAD_ERROR
      });
    });
  };
}

// organizationDeleteConfirm is called when the user confirms they want to delete
// and organization. It performs the API call to actually delete the organization
// and dispatches actions accordingly.
export function organizationDeleteConfirm(orgId) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;
    dispatch({type: types.ORGANIZATION_DELETE_CONFIRM, orgId: orgId});

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    return organizationsApi.deleteOrganization(scheme + ' ' + token, orgId)
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
        message: <div><strong>Could not delete organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}</div>,
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

// organizationCreateConfirm is called when the user confirms they want to create
// and organization. It performs the API call to actually create the organization
// and dispatches actions accordingly.
export function organizationCreateConfirm(orgId) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({type: types.ORGANIZATION_CREATE_CONFIRM});

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    return organizationsApi.addOrganization(scheme + ' ' + token, orgId, {})
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
        message: <div><strong>Could not create organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}</div>,
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

export function organizationAddMemberTyping(orgId) {
  return {
    type: types.ORGANIZATION_ADD_MEMBER_TYPING,
    orgId: orgId
  };
}

// organizationAddMemberConfirm is called when the user confirms they want to add
// a member to an organization. It performs the API call to actually do the job,
// and dispatches actions accordingly.
//
// It also checks if the member is already in the organization before proceeding.
export function organizationAddMemberConfirm(orgId, email) {
  return function(dispatch, getState) {
    dispatch({
      type: types.ORGANIZATION_ADD_MEMBER_CONFIRM,
      orgId: orgId,
      email: email
    });

    if (getState().entities.organizations && getState().entities.organizations.items && getState().entities.organizations.items[orgId] && getState().entities.organizations.items[orgId].members) {
      var members = getState().entities.organizations.items[orgId].members;
      var memberEmails = members.map((member) => {
        return member.email;
      });

      if (memberEmails.includes(email.toLowerCase())) {
        return dispatch({
          type: types.ORGANIZATION_ADD_MEMBER_ERROR,
          orgId: orgId,
          errorMessage: `User "${email}" is already in organization "${orgId}"`
        });
      }
    }

    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;
    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    return organizationsApi.getOrganization(scheme + ' ' + token, orgId)
    .then((organization) => {
      var members = organization.members.concat([{email: email}]);
      return organizationsApi.modifyOrganization(scheme + ' ' + token, orgId, {members});
    })
    .then(() => {return dispatch(organizationsLoad());})
    .then(dispatch.bind(this, modalHide()))
    .then(dispatch.bind(this, flashAdd({
      message: 'Successfully added `' + email + '` to organization: ' + '`' + orgId + '`',
      class: 'success',
      ttl: 3000
    })))
    .catch(() => {
      dispatch({
        type: types.ORGANIZATION_ADD_MEMBER_ERROR,
        orgId: orgId,
        errorMessage: <span>Could not add {email} to organization {orgId}.</span>
      });
    });
  };
}

// organizationRemoveMemberConfirm is called when the user confirms they want to remove
// a member from an organization. It performs the API call to actually do the job,
// and dispatches actions accordingly.
export function organizationRemoveMemberConfirm(orgId, email) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.ORGANIZATION_REMOVE_MEMBER_CONFIRM,
      orgId: orgId,
      email: email
    });

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    organizationsApi.getOrganization(scheme + ' ' + token, orgId)
    .then((organization) => {
      var members = organization.members.filter((member) => {return member.email !== email;});
      return organizationsApi.modifyOrganization(scheme + ' ' + token, orgId, {members});
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
        message: <div><strong>Could not remove user `{email}` from organization `{orgId}`</strong><br/>{error.body ? error.body.status_text : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}</div>,
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

export function organizationCredentialsLoad(orgId) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.ORGANIZATION_CREDENTIALS_LOAD
    });

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    organizationsApi.getCredentials(scheme + ' ' + token, orgId)
      .then((credentials) => {
        dispatch({
          type: types.ORGANIZATION_CREDENTIALS_LOAD_SUCCESS,
          credentials: credentials,
        });
      })
      .catch(error => {
        dispatch(flashAdd({
          message: (<div>
            <strong>Could not load credentials for organization `{orgId}`</strong>
            <br/>{error.body ? error.body.status_text : 'Please load the page again in a moment'}
          </div>),
          class: 'danger'
        }));

        dispatch({
          type: types.ORGANIZATION_CREDENTIALS_LOAD_ERROR
        });
      });
  };
}

export function organizationCredentialsSet(orgId, requestBody) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.ORGANIZATION_CREDENTIALS_SET
    });

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();
    organizationsApi.addCredentials(scheme + ' ' + token, orgId, requestBody)
      .then((response) => {
        console.log('ORGANIZATION_CREDENTIALS_SET_SUCCESS', response);
        dispatch({
          type: types.ORGANIZATION_CREDENTIALS_SET_SUCCESS,
          credentials: response,
        });
        
        dispatch(flashAdd({
          message: 'Credentials have been stored successfully.',
          class: 'success',
          ttl: 3000
        }));

      })
      .catch(error => {
        console.log('ORGANIZATION_CREDENTIALS_SET_ERROR', error);
        dispatch(flashAdd({
          message: (<div>
            <strong>Could not load credentials for organization `{orgId}`</strong>
            <br/>{error.body ? error.body.status_text : 'Please load the page again in a moment'}
          </div>),
          class: 'danger'
        }));

        dispatch({
          type: types.ORGANIZATION_CREDENTIALS_SET_ERROR
        });
      });
  };
}
