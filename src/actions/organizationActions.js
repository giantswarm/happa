'use strict';

import * as types from './actionTypes';
import { modalHide } from './modalActions';
import { flashAdd } from './flashMessageActions';
import React from 'react';
import GiantSwarmV4 from 'giantswarm-v4';
import { push } from 'connected-react-router';

// organizationSelect sets the organization that the user is focusing on and
// stores it in localstorage so that it persists when the users comes back
// after closing the browser window.
//
// It also ensures we have a valid cluster selected.
export function organizationSelect(orgId) {
  return function(dispatch) {
    dispatch(push('/'));

    return dispatch({
      type: types.ORGANIZATION_SELECT,
      orgId,
    });
  };
}

export function organizationDeleteSuccess(orgId) {
  return {
    type: types.ORGANIZATION_DELETE_SUCCESS,
    orgId,
  };
}

export function organizationsLoadSuccess(
  organizations,
  selectedOrganization,
  selectedCluster
) {
  return {
    type: types.ORGANIZATIONS_LOAD_SUCCESS,
    organizations,
    selectedOrganization,
    selectedCluster,
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

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    var alreadyFetching = getState().entities.organizations.isFetching;

    if (alreadyFetching) {
      return new Promise(resolve => {
        resolve();
      });
    }

    dispatch({ type: types.ORGANIZATIONS_LOAD });

    return organizationsApi
      .getOrganizations(scheme + ' ' + token)
      .then(organizations => {
        var organizationsArray = organizations.map(organization => {
          return organization.id;
        });

        var orgDetails = Promise.all(
          organizationsArray.map(organizationName => {
            return organizationsApi
              .getOrganization(scheme + ' ' + token, organizationName)
              .then(organization => {
                return organization;
              });
          })
        );

        return orgDetails;
      })
      .then(orgDetails => {
        // create an object with organization IDs as key
        var organizations = orgDetails.reduce((previous, current) => {
          var orgId = current.id;
          var orgDetails = current;

          orgDetails.members = orgDetails.members.sort();

          previous[orgId] = Object.assign(
            {},
            getState().entities.organizations.items[orgId],
            orgDetails
          );
          return previous;
        }, {});

        return dispatch(organizationsLoadSuccess(organizations));
      })
      .catch(error => {
        console.error(error);
        dispatch(
          flashAdd({
            message: (
              <div>
                <strong>
                  Something went wrong while trying to load the list of
                  organizations
                </strong>
                <br />
                {error.body
                  ? error.body.status_text
                  : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}
              </div>
            ),
            class: 'danger',
          })
        );

        dispatch({
          type: types.ORGANIZATIONS_LOAD_ERROR,
        });
      });
  };
}

// organizationDeleteConfirmed is called when the user confirms they want to delete
// and organization. It performs the API call to actually delete the organization
// and dispatches actions accordingly.
export function organizationDeleteConfirmed(orgId) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;
    dispatch({ type: types.ORGANIZATION_DELETE_CONFIRMED, orgId: orgId });

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    return organizationsApi
      .deleteOrganization(scheme + ' ' + token, orgId)
      .then(() => {
        return dispatch(organizationsLoad());
      })
      .then(dispatch.bind(this, modalHide()))
      .then(
        dispatch.bind(
          this,
          flashAdd({
            message: 'Successfully deleted organization: ' + orgId,
            class: 'success',
            ttl: 3000,
          })
        )
      )
      .then(() => {
        return dispatch(organizationDeleteSuccess(orgId));
      })
      .catch(error => {
        dispatch(modalHide());

        dispatch(
          flashAdd({
            message: (
              <div>
                <strong>Could not delete organization `{orgId}`</strong>
                <br />
                {error.body
                  ? error.body.status_text
                  : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}
              </div>
            ),
            class: 'danger',
          })
        );

        dispatch({
          type: types.ORGANIZATION_DELETE_ERROR,
        });
      });
  };
}

export function organizationDelete(orgId) {
  return {
    type: types.ORGANIZATION_DELETE,
    orgId: orgId,
  };
}

export function organizationCreate() {
  return {
    type: types.ORGANIZATION_CREATE,
  };
}

// organizationCreateConfirmed is called when the user confirms they want to create
// and organization. It performs the API call to actually create the organization
// and dispatches actions accordingly.
export function organizationCreateConfirmed(orgId) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({ type: types.ORGANIZATION_CREATE_CONFIRMED });

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    // When creating an org as a normal user, we must add ourselves to the org.
    // As an admin however, you can't add yourself to an org, because admins
    // don't actually have any user accounts in userd. So for admins,
    // we leave the members array empty.
    var members = [];
    if (!getState().app.loggedInUser.isAdmin) {
      members = [{ email: getState().app.loggedInUser.email }];
    }

    return organizationsApi
      .addOrganization(scheme + ' ' + token, orgId, {
        members: members,
      })
      .then(() => {
        return dispatch(organizationsLoad());
      })
      .then(dispatch.bind(this, modalHide()))
      .then(
        dispatch.bind(
          this,
          flashAdd({
            message: 'Successfully created organization: ' + orgId,
            class: 'success',
            ttl: 3000,
          })
        )
      )
      .catch(error => {
        dispatch(modalHide());

        dispatch(
          flashAdd({
            message: (
              <div>
                <strong>Could not create organization `{orgId}`</strong>
                <br />
                {error.body
                  ? error.body.status_text
                  : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}
              </div>
            ),
            class: 'danger',
          })
        );

        dispatch({
          type: types.ORGANIZATION_CREATE_ERROR,
        });
      });
  };
}

export function organizationAddMember(orgId) {
  return {
    type: types.ORGANIZATION_ADD_MEMBER,
    orgId: orgId,
  };
}

export function organizationAddMemberTyping(orgId) {
  return {
    type: types.ORGANIZATION_ADD_MEMBER_TYPING,
    orgId: orgId,
  };
}

// organizationAddMemberConfirmed is called when the user confirms they want to add
// a member to an organization. It performs the API call to actually do the job,
// and dispatches actions accordingly.
//
// It also checks if the member is already in the organization before proceeding.
export function organizationAddMemberConfirmed(orgId, email) {
  return function(dispatch, getState) {
    dispatch({
      type: types.ORGANIZATION_ADD_MEMBER_CONFIRMED,
      orgId: orgId,
      email: email,
    });

    if (
      getState().entities.organizations &&
      getState().entities.organizations.items &&
      getState().entities.organizations.items[orgId] &&
      getState().entities.organizations.items[orgId].members
    ) {
      var members = getState().entities.organizations.items[orgId].members;
      var memberEmails = members.map(member => {
        return member.email;
      });

      if (memberEmails.includes(email.toLowerCase())) {
        return dispatch({
          type: types.ORGANIZATION_ADD_MEMBER_ERROR,
          orgId: orgId,
          errorMessage: `User "${email}" is already in organization "${orgId}"`,
        });
      }
    }

    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;
    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    return organizationsApi
      .getOrganization(scheme + ' ' + token, orgId)
      .then(organization => {
        var members = organization.members.concat([{ email: email }]);
        return organizationsApi.modifyOrganization(
          scheme + ' ' + token,
          orgId,
          { members }
        );
      })
      .then(() => {
        return dispatch(organizationsLoad());
      })
      .then(dispatch.bind(this, modalHide()))
      .then(
        dispatch.bind(
          this,
          flashAdd({
            message:
              'Successfully added `' +
              email +
              '` to organization: ' +
              '`' +
              orgId +
              '`',
            class: 'success',
            ttl: 3000,
          })
        )
      )
      .catch(() => {
        dispatch({
          type: types.ORGANIZATION_ADD_MEMBER_ERROR,
          orgId: orgId,
          errorMessage: (
            <span>
              Could not add {email} to organization {orgId}.
            </span>
          ),
        });
      });
  };
}

// organizationRemoveMemberConfirmed is called when the user confirms they want to remove
// a member from an organization. It performs the API call to actually do the job,
// and dispatches actions accordingly.
export function organizationRemoveMemberConfirmed(orgId, email) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.ORGANIZATION_REMOVE_MEMBER_CONFIRMED,
      orgId: orgId,
      email: email,
    });

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    organizationsApi
      .getOrganization(scheme + ' ' + token, orgId)
      .then(organization => {
        var members = organization.members.filter(member => {
          return member.email !== email;
        });
        return organizationsApi.modifyOrganization(
          scheme + ' ' + token,
          orgId,
          { members }
        );
      })
      .then(() => {
        return dispatch(organizationsLoad());
      })
      .then(dispatch.bind(this, modalHide()))
      .then(
        dispatch.bind(
          this,
          flashAdd({
            message:
              'Successfully removed `' +
              email +
              '` from organization: ' +
              '`' +
              orgId +
              '`',
            class: 'success',
            ttl: 3000,
          })
        )
      )
      .catch(error => {
        dispatch(modalHide());

        dispatch(
          flashAdd({
            message: (
              <div>
                <strong>
                  Could not remove user `{email}` from organization `{orgId}`
                </strong>
                <br />
                {error.body
                  ? error.body.status_text
                  : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}
              </div>
            ),
            class: 'danger',
          })
        );

        dispatch({
          type: types.ORGANIZATION_REMOVE_MEMBER_ERROR,
        });
      });
  };
}

export function organizationRemoveMember(orgId, email) {
  return {
    type: types.ORGANIZATION_REMOVE_MEMBER,
    orgId: orgId,
    email: email,
  };
}

// organizationCredentialsLoad is called to load credentials for an organization.
export function organizationCredentialsLoad(orgId) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.ORGANIZATION_CREDENTIALS_LOAD,
    });

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();

    organizationsApi
      .getCredentials(scheme + ' ' + token, orgId)
      .then(credentials => {
        dispatch({
          type: types.ORGANIZATION_CREDENTIALS_LOAD_SUCCESS,
          credentials: credentials,
        });
      })
      .catch(error => {
        dispatch(
          flashAdd({
            message: (
              <div>
                <strong>
                  Could not load credentials for organization `{orgId}`
                </strong>
                <br />
                {error.body
                  ? error.body.status_text
                  : 'Please load the page again in a moment'}
              </div>
            ),
            class: 'danger',
          })
        );

        dispatch({
          type: types.ORGANIZATION_CREDENTIALS_LOAD_ERROR,
        });
      });
  };
}

// organizationCredentialsSet reveals the form necessary to set credentials for an
// organization.
export function organizationCredentialsSet() {
  return function(dispatch) {
    dispatch({
      type: types.ORGANIZATION_CREDENTIALS_SET,
    });
  };
}

// organizationCredentialsSetConfirmed performs the API request to set the credentials
// for an organization and handles the result.
export function organizationCredentialsSetConfirmed(provider, orgId, data) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;

    dispatch({
      type: types.ORGANIZATION_CREDENTIALS_SET_CONFIRMED,
    });

    let requestBody = new GiantSwarmV4.V4AddCredentialsRequest();
    requestBody.provider = provider;

    if (provider === 'azure') {
      requestBody.azure = new GiantSwarmV4.V4AddCredentialsRequestAzure();
      requestBody.azure.credential = new GiantSwarmV4.V4AddCredentialsRequestAzureCredential(
        data.azureClientID,
        data.azureClientSecret,
        data.azureSubscriptionID,
        data.azureTenantID
      );
    } else if (provider === 'aws') {
      requestBody.aws = new GiantSwarmV4.V4AddCredentialsRequestAws();
      requestBody.aws.roles = new GiantSwarmV4.V4AddCredentialsRequestAwsRoles(
        data.awsAdminRoleARN,
        data.awsOperatorRoleARN
      );
    }

    var organizationsApi = new GiantSwarmV4.OrganizationsApi();
    organizationsApi
      .addCredentials(scheme + ' ' + token, orgId, requestBody)
      .then(response => {
        // perform the API call

        dispatch(
          flashAdd({
            message: 'Credentials have been stored successfully.',
            class: 'success',
            ttl: 3000,
          })
        );

        dispatch({
          type: types.ORGANIZATION_CREDENTIALS_SET_SUCCESS,
          response,
        });
      })
      .then(() => {
        // update credentials data for the organization
        return dispatch(organizationCredentialsLoad(orgId));
      })
      .catch(error => {
        console.log('ORGANIZATION_CREDENTIALS_SET_ERROR', error);
        dispatch(
          flashAdd({
            message: (
              <div>
                <strong>
                  Could not set credentials for organization `{orgId}`
                </strong>
                <br />
                {error.body
                  ? error.body.message
                  : 'Please load the page again in a moment'}
              </div>
            ),
            class: 'danger',
          })
        );

        dispatch({
          type: types.ORGANIZATION_CREDENTIALS_SET_ERROR,
        });
      });
  };
}
