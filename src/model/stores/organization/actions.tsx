import GiantSwarm, { V4Organization } from 'giantswarm';
import { HttpClientImpl } from 'model/clients/HttpClient';
import { Providers } from 'model/constants';
import * as authorizationv1 from 'model/services/mapi/authorizationv1';
import * as securityv1alpha1 from 'model/services/mapi/securityv1alpha1';
import { getLoggedInUser, getUserIsAdmin } from 'model/stores/main/selectors';
import { modalHide } from 'model/stores/modal/actions';
import { ModalActions } from 'model/stores/modal/types';
import {
  ORGANIZATION_ADD_MEMBER_CONFIRMED,
  ORGANIZATION_ADD_MEMBER_ERROR,
  ORGANIZATION_ADD_MEMBER_REQUEST,
  ORGANIZATION_CREATE_CONFIRMED,
  ORGANIZATION_CREATE_ERROR,
  ORGANIZATION_CREATE_REQUEST,
  ORGANIZATION_CREATE_SUCCESS,
  ORGANIZATION_CREDENTIALS_LOAD_ERROR,
  ORGANIZATION_CREDENTIALS_LOAD_REQUEST,
  ORGANIZATION_CREDENTIALS_LOAD_SUCCESS,
  ORGANIZATION_CREDENTIALS_SET,
  ORGANIZATION_CREDENTIALS_SET_CONFIRMED_REQUEST,
  ORGANIZATION_CREDENTIALS_SET_DISCARD,
  ORGANIZATION_CREDENTIALS_SET_ERROR,
  ORGANIZATION_CREDENTIALS_SET_SUCCESS,
  ORGANIZATION_DELETE_CONFIRMED,
  ORGANIZATION_DELETE_ERROR,
  ORGANIZATION_DELETE_REQUEST,
  ORGANIZATION_DELETE_SUCCESS,
  ORGANIZATION_LOAD_ERROR,
  ORGANIZATION_LOAD_MAPI_REQUEST,
  ORGANIZATION_LOAD_REQUEST,
  ORGANIZATION_LOAD_SUCCESS,
  ORGANIZATION_REMOVE_MEMBER,
  ORGANIZATION_REMOVE_MEMBER_CONFIRMED_REQUEST,
  ORGANIZATION_REMOVE_MEMBER_ERROR,
  ORGANIZATION_SELECT,
} from 'model/stores/organization/constants';
import { OrganizationActions } from 'model/stores/organization/types';
import { IState } from 'model/stores/state';
import React from 'react';
import { ThunkAction } from 'redux-thunk';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { setOrganizationToStorage } from 'utils/localStorageUtils';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import { determineSelectedOrganization } from 'utils/organizationUtils';

/**
 * Sets the organization that the user is focusing on and
 * stores it in `Local Storage` so that it persists when the
 * user comes back after closing the browser window. It
 * also ensures we have a valid cluster selected.
 * @param orgId
 */
export function organizationSelect(
  orgId: string
): ThunkAction<void, IState, void, OrganizationActions> {
  return (dispatch) => {
    setOrganizationToStorage(orgId);

    return dispatch({
      type: ORGANIZATION_SELECT,
      orgId,
    });
  };
}

export function organizationDeleteSuccess(orgId: string): OrganizationActions {
  return {
    type: ORGANIZATION_DELETE_SUCCESS,
    orgId,
  };
}

export function organizationsLoadSuccess(
  organizations: Record<string, IOrganization>,
  selectedOrganization: string | null
): OrganizationActions {
  return {
    type: ORGANIZATION_LOAD_SUCCESS,
    organizations,
    selectedOrganization,
  };
}

/**
 * This action loads organizations using the MAPI instead of the GS Rest API.
 * @param auth
 */
export function organizationsLoadMAPI(
  auth: IOAuth2Provider
): ThunkAction<Promise<void>, IState, void, OrganizationActions> {
  return async (dispatch, getState) => {
    try {
      const currentOrganizations = getState().entities.organizations;
      const alreadyFetching = currentOrganizations.isFetching;
      if (alreadyFetching) {
        return Promise.resolve();
      }

      dispatch({ type: ORGANIZATION_LOAD_MAPI_REQUEST });

      const client = new HttpClientImpl();

      // Can I LIST Organization CR's ?
      let canList = false;
      const request: authorizationv1.ISelfSubjectAccessReviewSpec = {
        resourceAttributes: {
          namespace: 'default',
          verb: 'list',
          group: 'security.giantswarm.io',
          resource: 'organizations',
        },
      };
      const accessReviewResponse =
        await authorizationv1.createSelfSubjectAccessReview(
          client,
          auth,
          request
        );

      if (accessReviewResponse.status?.allowed) {
        canList = true;
      }

      const orgs: Record<string, IOrganization> = {};
      if (canList) {
        // The user can list all orgs. So list them all and dispatch the action that
        // updates the global state with all the orgs
        const orgListResponse = await securityv1alpha1.getOrganizationList(
          client,
          auth
        );
        for (const org of orgListResponse.items) {
          orgs[securityv1alpha1.getOrganizationName(org)] = {
            id: securityv1alpha1.getOrganizationName(org),
            name: securityv1alpha1.getOrganizationUIName(org),
            namespace: org.status?.namespace,
            credentials: [],
            members: [],
          };
        }
      } else {
        const rulesReview: authorizationv1.ISelfSubjectRulesReview = {
          apiVersion: 'authorization.k8s.io/v1',
          kind: 'SelfSubjectRulesReview',
          spec: {
            namespace: 'default',
          },
        } as authorizationv1.ISelfSubjectRulesReview;

        // The user can't list all orgs. So do a selfSubjectRulesReview to figure out
        // which ones they can get.
        const rulesReviewResponse =
          await authorizationv1.createSelfSubjectRulesReview(
            client,
            auth,
            rulesReview
          );

        const organizationNames = [];
        for (const rule of rulesReviewResponse.status?.resourceRules) {
          if (
            rule.verbs.includes('get') &&
            rule.resources.includes('organizations') &&
            rule.resourceNames
          ) {
            organizationNames.push(...rule.resourceNames);
          }
        }

        // We now know what orgs they can get. We still need to fetch them
        // to check if the orgs have a 'ui.giantswarm.io/original-organization-name'
        // annotation.
        const orgGetRequests = organizationNames.map((orgName) =>
          securityv1alpha1.getOrganization(client, auth, orgName)
        );

        const orgGetResponses = await Promise.all(orgGetRequests);
        for (const org of orgGetResponses) {
          orgs[securityv1alpha1.getOrganizationName(org)] = {
            id: securityv1alpha1.getOrganizationName(org),
            name: securityv1alpha1.getOrganizationUIName(org),
            namespace: org.status?.namespace,
            credentials: [],
            members: [],
          };
        }
      }

      const currentlySelectedOrganization =
        getState().main.selectedOrganization;
      const selectedOrganization = determineSelectedOrganization(
        Object.keys(orgs),
        currentlySelectedOrganization
      );
      setOrganizationToStorage(selectedOrganization);

      dispatch(organizationsLoadSuccess(orgs, selectedOrganization));

      return Promise.resolve();
    } catch (error) {
      // Dispatch error action
      dispatch({
        type: ORGANIZATION_LOAD_ERROR,
      });

      return Promise.reject(error);
    }
  };
}

/**
 * This action does various requests to the Giant Swarm API
 * and massages the responses into some reasonable state for Happa to
 * work with.
 */
export function organizationsLoad(): ThunkAction<
  Promise<void>,
  IState,
  void,
  OrganizationActions
> {
  return async (dispatch, getState) => {
    try {
      const currentOrganizations = getState().entities.organizations;
      const alreadyFetching = currentOrganizations.isFetching;
      if (alreadyFetching) {
        return Promise.resolve();
      }

      dispatch({ type: ORGANIZATION_LOAD_REQUEST });

      const organizationsApi = new GiantSwarm.OrganizationsApi();
      const organizations = await organizationsApi.getOrganizations();

      const organizationsWithDetails = await Promise.all(
        organizations.map((organization) => {
          const organizationID = organization.id;

          return updateOrganizationDetailsForID(
            organizationID,
            currentOrganizations.items[organizationID]
          );
        })
      );

      const organizationsAsMap = organizationsWithDetails.reduce(
        (orgAcc: Record<string, IOrganization>, currentOrg: IOrganization) => {
          orgAcc[currentOrg.id] = currentOrg;

          return orgAcc;
        },
        {}
      );

      const currentlySelectedOrganization =
        getState().main.selectedOrganization;
      const selectedOrganization = determineSelectedOrganization(
        Object.keys(organizationsAsMap),
        currentlySelectedOrganization
      );
      setOrganizationToStorage(selectedOrganization);

      dispatch(
        organizationsLoadSuccess(organizationsAsMap, selectedOrganization)
      );

      return Promise.resolve();
    } catch (error) {
      dispatch({
        type: ORGANIZATION_LOAD_ERROR,
      });

      return Promise.reject(error);
    }
  };
}

/**
 * Update organization details and credentials for ID.
 * @param id
 * @param previousOrganizationDetails - Previous organization details to append data to.
 */
async function updateOrganizationDetailsForID(
  id: string,
  previousOrganizationDetails = {} as IOrganization
): Promise<IOrganization> {
  const organizationsApi = new GiantSwarm.OrganizationsApi();
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
      credentials: Array.from(organizationCredentials),
    }
  );

  return organizationWithCredentials;
}

export function organizationDeleteConfirmed(
  orgId: string
): ThunkAction<
  Promise<boolean>,
  IState,
  void,
  OrganizationActions | ModalActions
> {
  return async (dispatch) => {
    try {
      dispatch({ type: ORGANIZATION_DELETE_CONFIRMED, orgId });

      const organizationsApi = new GiantSwarm.OrganizationsApi();
      await organizationsApi.deleteOrganization(orgId);

      new FlashMessage(
        (
          <>
            Organization <code>{orgId}</code> deleted
          </>
        ),
        messageType.INFO,
        messageTTL.SHORT
      );

      await dispatch(organizationsLoad());
      dispatch(organizationDeleteSuccess(orgId));

      return true;
    } catch (err) {
      new FlashMessage(
        (
          <>
            Could not delete organization <code>{orgId}</code>.
          </>
        ),
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again or contact support at support@giantswarm.io.'
      );

      dispatch({
        type: ORGANIZATION_DELETE_ERROR,
      });

      ErrorReporter.getInstance().notify(err as Error);

      return false;
    }
  };
}

export function organizationDelete(orgId: string): OrganizationActions {
  return {
    type: ORGANIZATION_DELETE_REQUEST,
    orgId,
  };
}

export function organizationCreate(): OrganizationActions {
  return { type: ORGANIZATION_CREATE_REQUEST };
}

export function organizationCreateConfirmed(
  orgId: string
): ThunkAction<void, IState, void, OrganizationActions | ModalActions> {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: ORGANIZATION_CREATE_CONFIRMED });

      /**
       * When creating an org as a normal user, we must add ourselves to the org.
       * As an admin however, you can't add yourself to an org, because admins
       * don't actually have any user accounts in userd. So for admins,
       * we leave the members array empty.
       */
      const state = getState();
      let members: IOrganizationMember[] = [];
      if (!getUserIsAdmin(state)) {
        members = [{ email: getLoggedInUser(state)?.email ?? '' }];
      }

      const organizationsApi = new GiantSwarm.OrganizationsApi();
      await organizationsApi.addOrganization(orgId, {
        members,
      } as V4Organization);

      new FlashMessage(
        (
          <>
            Organization <code>{orgId}</code> has been created
          </>
        ),
        messageType.SUCCESS,
        messageTTL.SHORT
      );

      dispatch({
        type: ORGANIZATION_CREATE_SUCCESS,
      });
      await dispatch(organizationsLoad());
    } catch (err) {
      new FlashMessage(
        (
          <>
            Could not create organization <code>{orgId}</code>
          </>
        ),
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again in a moment or contact support at support@giantswarm.io'
      );

      dispatch({
        type: ORGANIZATION_CREATE_ERROR,
      });

      ErrorReporter.getInstance().notify(err as Error);
    } finally {
      dispatch(modalHide());
    }
  };
}

export function organizationAddMember(orgId: string): OrganizationActions {
  return {
    type: ORGANIZATION_ADD_MEMBER_REQUEST,
    orgId,
  };
}

export function organizationAddMemberConfirmed(
  orgId: string,
  email: string
): ThunkAction<void, IState, void, OrganizationActions | ModalActions> {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: ORGANIZATION_ADD_MEMBER_CONFIRMED,
        orgId,
        email,
      });

      let members = getState().entities.organizations?.items?.[orgId]?.members;
      if (members) {
        const memberEmails = members.map((member) => {
          return member.email;
        });

        if (memberEmails.includes(email.toLowerCase())) {
          dispatch({
            type: ORGANIZATION_ADD_MEMBER_ERROR,
            orgId,
            errorMessage: `User "${email}" is already in organization "${orgId}"`,
          });

          return;
        }
      }

      const organizationsApi = new GiantSwarm.OrganizationsApi();
      const organization = await organizationsApi.getOrganization(orgId);
      members = organization.members.concat([{ email }]);
      await organizationsApi.modifyOrganization(orgId, { members });

      new FlashMessage(
        (
          <>
            Added <code>{email}</code> to organization <code>{orgId}</code>
          </>
        ),
        messageType.SUCCESS,
        messageTTL.MEDIUM
      );

      await dispatch(organizationsLoad());
      dispatch(modalHide());
    } catch (err) {
      dispatch({
        type: ORGANIZATION_ADD_MEMBER_ERROR,
        orgId,
        errorMessage: `Could not add ${email} to organization ${orgId}.`,
      });

      ErrorReporter.getInstance().notify(err as Error);
    }
  };
}

export function organizationRemoveMemberConfirmed(
  orgId: string,
  email: string
): ThunkAction<void, IState, void, OrganizationActions | ModalActions> {
  return async (dispatch) => {
    try {
      dispatch({
        type: ORGANIZATION_REMOVE_MEMBER_CONFIRMED_REQUEST,
        orgId,
        email,
      });

      const organizationsApi = new GiantSwarm.OrganizationsApi();
      const organization = await organizationsApi.getOrganization(orgId);

      const members = organization.members.filter((member) => {
        return member.email !== email;
      });
      await organizationsApi.modifyOrganization(orgId, { members });

      new FlashMessage(
        (
          <>
            Removed <code>{email}</code> from organization <code>{orgId}</code>
          </>
        ),
        messageType.INFO,
        messageTTL.MEDIUM
      );

      await dispatch(organizationsLoad());
    } catch (err) {
      new FlashMessage(
        (
          <>
            Error removing <code>{email}</code> from organization{' '}
            <code>{orgId}</code>
          </>
        ),
        messageType.ERROR,
        messageTTL.LONG
      );

      dispatch({
        type: ORGANIZATION_REMOVE_MEMBER_ERROR,
      });

      ErrorReporter.getInstance().notify(err as Error);
    } finally {
      dispatch(modalHide());
    }
  };
}

export function organizationRemoveMember(
  orgId: string,
  email: string
): OrganizationActions {
  return {
    type: ORGANIZATION_REMOVE_MEMBER,
    orgId,
    email,
  };
}

export function organizationCredentialsLoad(
  orgId: string
): ThunkAction<Promise<void>, IState, void, OrganizationActions> {
  return async (dispatch) => {
    try {
      dispatch({
        type: ORGANIZATION_CREDENTIALS_LOAD_REQUEST,
      });

      const organizationsApi = new GiantSwarm.OrganizationsApi();
      const credentials = await organizationsApi.getCredentials(orgId);
      dispatch({
        type: ORGANIZATION_CREDENTIALS_LOAD_SUCCESS,
        credentials: Array.from(credentials),
      });
    } catch (err) {
      new FlashMessage(
        (
          <>
            Could not load credentials for <code>{orgId}</code>.
          </>
        ),
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again in a moment or contact support at support@giantswarm.io.'
      );

      dispatch({
        type: ORGANIZATION_CREDENTIALS_LOAD_ERROR,
      });

      ErrorReporter.getInstance().notify(err as Error);
    }
  };
}

export function organizationCredentialsSet(): ThunkAction<
  void,
  IState,
  void,
  OrganizationActions
> {
  return (dispatch) => {
    dispatch({
      type: ORGANIZATION_CREDENTIALS_SET,
    });
  };
}

export function organizationCredentialsDiscard(): OrganizationActions {
  return {
    type: ORGANIZATION_CREDENTIALS_SET_DISCARD,
  };
}

interface IOrganizationCredentialsData {
  azureSubscriptionID: string;
  azureTenantID: string;
  azureClientID: string;
  azureClientSecret: string;
  azureClientSecretAgain: string;
  awsAdminRoleARN: string;
  awsOperatorRoleARN: string;
}

export function organizationCredentialsSetConfirmed(
  provider: PropertiesOf<typeof Providers>,
  orgId: string,
  data: IOrganizationCredentialsData
): ThunkAction<void, IState, void, OrganizationActions> {
  return async (dispatch) => {
    try {
      dispatch({ type: ORGANIZATION_CREDENTIALS_SET_CONFIRMED_REQUEST });

      const requestBody = new GiantSwarm.V4AddCredentialsRequest(provider);
      if (provider === Providers.AZURE) {
        requestBody.azure = new GiantSwarm.V4AddCredentialsRequestAzure();
        requestBody.azure.credential =
          new GiantSwarm.V4AddCredentialsRequestAzureCredential(
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

      const organizationsApi = new GiantSwarm.OrganizationsApi();
      const addCredentialsResponse = await organizationsApi.addCredentials(
        orgId,
        requestBody
      );
      new FlashMessage(
        'Credentials have been stored successfully',
        messageType.INFO,
        messageTTL.SHORT
      );

      dispatch({
        type: ORGANIZATION_CREDENTIALS_SET_SUCCESS,
        response: addCredentialsResponse,
      });

      await dispatch(organizationCredentialsLoad(orgId));
    } catch (err) {
      new FlashMessage(
        (
          <>
            Could not set credentials for organization <code>{orgId}</code>.
          </>
        ),
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again in a moment or contact support at support@giantswarm.io.'
      );

      dispatch({
        type: ORGANIZATION_CREDENTIALS_SET_ERROR,
      });

      ErrorReporter.getInstance().notify(err as Error);
    }
  };
}
