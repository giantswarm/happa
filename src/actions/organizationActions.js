import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { modalHide } from './modalActions';
import { Providers } from 'shared/constants';
import { setOrganizationToStorage } from 'utils/localStorageUtils';
import GiantSwarm from 'giantswarm';
import React from 'react';

/**
 * Sets the organization that the user is focusing on and
 * stores it in `Local Storage` so that it persists when the
 * user comes back after closing the browser window. It
 * also ensures we have a valid cluster selected.
 *
 * @param {String} orgId Organization ID
 */
export function organizationSelect(orgId) {
  return function(dispatch) {
    setOrganizationToStorage(orgId);

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

export function organizationsLoadSuccess(organizations, selectedOrganization) {
  return {
    type: types.ORGANIZATIONS_LOAD_SUCCESS,
    organizations,
    selectedOrganization,
  };
}

// determineSelectedOrganization takes a current list of organizations and the
// users selectedOrganization (which could be stale, i.e. deleted by someone
// else)
//
// Using this information, it ensures we always have a valid organization selected.
const determineSelectedOrganization = (organizations, selectedOrganization) => {
  const organizationStillExists = organizations.includes(selectedOrganization);

  if (selectedOrganization && organizationStillExists) {
    // The user had an organization selected, and it still exists.
    // So we stay on it.
    return selectedOrganization;
  }
  // The user didn't have an organization selected yet, or the one
  // they selected is gone. Switch to the first organization in the list.
  const firstOrganization = organizations[0];

  return firstOrganization;
};

/**
 * This action does various requests to the Giant Swarm API
 * and massages the responses into some reasonable state for Happa to
 * work with.
 */
export function organizationsLoad() {
  return async (dispatch, getState) => {
    try {
      const currentOrganizations = getState().entities.organizations;
      const alreadyFetching = currentOrganizations.isFetching;

      if (alreadyFetching) {
        return new Promise(resolve => resolve());
      }

      dispatch({ type: types.ORGANIZATIONS_LOAD });

      const organizationsApi = new GiantSwarm.OrganizationsApi();
      const organizations = await organizationsApi.getOrganizations();
      const currentlySelectedOrganization = getState().app.selectedOrganization;

      const organizationsWithDetails = await Promise.all(
        organizations.map(organization => {
          const organizationID = organization.id;

          return updateOrganizationDetailsForID(
            organizationID,
            currentOrganizations.items[organizationID]
          );
        })
      );
      const organizationsAsMap = organizationsWithDetails.reduce(
        (orgAcc, currentOrg) => {
          orgAcc[currentOrg.id] = currentOrg;

          return orgAcc;
        },
        {}
      );

      const selectedOrganization = determineSelectedOrganization(
        Object.keys(organizationsAsMap),
        currentlySelectedOrganization
      );

      setOrganizationToStorage(selectedOrganization);

      return dispatch(
        organizationsLoadSuccess(organizationsAsMap, selectedOrganization)
      );
    } catch (error) {
      console.error('Error loading organizations:', error);

      new FlashMessage(
        'An error occurred as we tried to load organizations.',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io.'
      );

      dispatch({
        type: types.ORGANIZATIONS_LOAD_ERROR,
      });
    }
  };
}

/**
 * Update organization details and credentials for ID
 * @param {String} id Organization ID
 * @param {Record<string, any>} previousOrganizationDetails Previous organization details to append data to
 */
async function updateOrganizationDetailsForID(
  id,
  previousOrganizationDetails = {}
) {
  const organizationsApi = new GiantSwarm.OrganizationsApi();

  /**
   * @type {[Object, Array]}
   */
  const organizationDetails = await Promise.all([
    organizationsApi.getOrganization(id),
    organizationsApi.getCredentials(id),
  ]);

  const [organizationInfo, organizationCredentials] = organizationDetails;
  const sortedMembers = organizationInfo.members.sort();

  const organizationWithCredentials = Object.assign(
    {},
    previousOrganizationDetails,
    organizationInfo,
    {
      members: sortedMembers,
      credentials: organizationCredentials,
    }
  );

  return organizationWithCredentials;
}

// organizationDeleteConfirmed is called when the user confirms they want to delete
// and organization. It performs the API call to actually delete the organization
// and dispatches actions accordingly.
export function organizationDeleteConfirmed(orgId) {
  return function(dispatch) {
    dispatch({ type: types.ORGANIZATION_DELETE_CONFIRMED, orgId: orgId });

    var organizationsApi = new GiantSwarm.OrganizationsApi();

    return organizationsApi
      .deleteOrganization(orgId)
      .then(() => {
        new FlashMessage(
          'Organization  <code>' + orgId + '</code> deleted',
          messageType.INFO,
          messageTTL.SHORT
        );

        return dispatch(organizationsLoad());
      })
      .then(dispatch.bind(this, modalHide()))
      .then(() => {
        return dispatch(organizationDeleteSuccess(orgId));
      })
      .catch(error => {
        dispatch(modalHide());
        console.error('Error deleting organization:', error);

        new FlashMessage(
          'Could not delete organization <code>' + orgId + '</code>.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again or contact support at support@giantswarm.io.'
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
    dispatch({ type: types.ORGANIZATION_CREATE_CONFIRMED });

    var organizationsApi = new GiantSwarm.OrganizationsApi();

    // When creating an org as a normal user, we must add ourselves to the org.
    // As an admin however, you can't add yourself to an org, because admins
    // don't actually have any user accounts in userd. So for admins,
    // we leave the members array empty.
    var members = [];
    if (!getState().app.loggedInUser.isAdmin) {
      members = [{ email: getState().app.loggedInUser.email }];
    }

    return organizationsApi
      .addOrganization(orgId, {
        members: members,
      })
      .then(() => {
        // Success
        new FlashMessage(
          'Organization <code>' + orgId + '</code> has been created',
          messageType.SUCCESS,
          messageTTL.SHORT
        );

        dispatch({
          type: types.ORGANIZATION_CREATE_SUCCESS,
        });

        return dispatch(organizationsLoad());
      })
      .then(dispatch.bind(this, modalHide()))
      .catch(error => {
        console.error('Error creating organization:', error);
        dispatch(modalHide());

        new FlashMessage(
          'Could not create organization <code>' + orgId + '</code>',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again in a moment or contact support at support@giantswarm.io'
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

    var organizationsApi = new GiantSwarm.OrganizationsApi();

    return organizationsApi
      .getOrganization(orgId)
      .then(organization => {
        var members = organization.members.concat([{ email: email }]);
        return organizationsApi.modifyOrganization(orgId, { members });
      })
      .then(() => {
        new FlashMessage(
          'Added <code>' +
            email +
            '</code> to organization <code>' +
            orgId +
            '</code>',
          messageType.SUCCESS,
          messageTTL.MEDIUM
        );

        return dispatch(organizationsLoad());
      })
      .then(dispatch.bind(this, modalHide()))
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
  return function(dispatch) {
    dispatch({
      type: types.ORGANIZATION_REMOVE_MEMBER_CONFIRMED,
      orgId: orgId,
      email: email,
    });

    var organizationsApi = new GiantSwarm.OrganizationsApi();

    organizationsApi
      .getOrganization(orgId)
      .then(organization => {
        var members = organization.members.filter(member => {
          return member.email !== email;
        });
        return organizationsApi.modifyOrganization(orgId, { members });
      })
      .then(() => {
        new FlashMessage(
          'Removed <code>' +
            email +
            '</code> from organization <code>' +
            orgId +
            '</code>',
          messageType.INFO,
          messageTTL.MEDIUM
        );

        return dispatch(organizationsLoad());
      })
      .then(dispatch.bind(this, modalHide()))
      .catch(error => {
        console.error('Error removing member from org:', error);
        dispatch(modalHide());

        new FlashMessage(
          'Error removing <code>' +
            email +
            '</code> from organization <code>' +
            orgId +
            '</code>',
          messageType.ERROR,
          messageTTL.LONG
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
  return function(dispatch) {
    dispatch({
      type: types.ORGANIZATION_CREDENTIALS_LOAD,
    });

    var organizationsApi = new GiantSwarm.OrganizationsApi();

    organizationsApi
      .getCredentials(orgId)
      .then(credentials => {
        dispatch({
          type: types.ORGANIZATION_CREDENTIALS_LOAD_SUCCESS,
          credentials: credentials,
        });
      })
      .catch(error => {
        console.error('Error loading credentials for organization:', error);
        new FlashMessage(
          'Could not load credentials for <code>' + orgId + '</code>.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again in a moment or contact support at support@giantswarm.io.'
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
  return function(dispatch) {
    dispatch({
      type: types.ORGANIZATION_CREDENTIALS_SET_CONFIRMED,
    });

    let requestBody = new GiantSwarm.V4AddCredentialsRequest();
    requestBody.provider = provider;

    if (provider === Providers.AZURE) {
      requestBody.azure = new GiantSwarm.V4AddCredentialsRequestAzure();
      requestBody.azure.credential = new GiantSwarm.V4AddCredentialsRequestAzureCredential(
        data.azureClientID,
        data.azureClientSecret,
        data.azureSubscriptionID,
        data.azureTenantID
      );
    } else if (provider === Providers.AWS) {
      requestBody.aws = new GiantSwarm.V4AddCredentialsRequestAws();
      requestBody.aws.roles = new GiantSwarm.V4AddCredentialsRequestAwsRoles(
        data.awsAdminRoleARN,
        data.awsOperatorRoleARN
      );
    }

    var organizationsApi = new GiantSwarm.OrganizationsApi();
    organizationsApi
      .addCredentials(orgId, requestBody)
      .then(response => {
        new FlashMessage(
          'Credentials have been stored successfully',
          messageType.INFO,
          messageTTL.SHORT
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
        console.error('ORGANIZATION_CREDENTIALS_SET_ERROR', error);

        new FlashMessage(
          'Could not set credentials for organization <code>' +
            orgId +
            '</code>.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again in a moment or contact support at support@giantswarm.io.'
        );

        dispatch({
          type: types.ORGANIZATION_CREDENTIALS_SET_ERROR,
        });
      });
  };
}
