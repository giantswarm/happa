import GiantSwarm, { V4Organization } from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { HttpClientImpl } from 'model/clients/HttpClient';
import { selfSubjectRulesReview } from 'model/services/mapi/authorizationv1';
import {
  ISelfSubjectAccessReviewSpec,
  selfSubjectAccessReview,
} from 'model/services/mapi/authorizationv1/';
import {
  getOrganization,
  getOrganizationList,
} from 'model/services/mapi/securityv1alpha1/';
import { getOrganizationUIName } from 'model/services/mapi/securityv1alpha1/key';
import { ThunkAction } from 'redux-thunk';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { getLoggedInUser, getUserIsAdmin } from 'stores/main/selectors';
import { modalHide } from 'stores/modal/actions';
import { ModalActions } from 'stores/modal/types';
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
} from 'stores/organization/constants';
import { OrganizationActions } from 'stores/organization/types';
import { IState } from 'stores/state';
import { setOrganizationToStorage } from 'utils/localStorageUtils';
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
 */
export function organizationsLoadMAPI(): ThunkAction<
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

      dispatch({ type: ORGANIZATION_LOAD_MAPI_REQUEST });

      const client = new HttpClientImpl();
      const user = getLoggedInUser(getState());

      if (!user) {
        return Promise.reject(
          new Error('cannot load orgs without being logged in')
        );
      }

      // Can I LIST Organization CR's ?
      let canList = false;
      const request: ISelfSubjectAccessReviewSpec = {
        resourceAttributes: {
          namespace: 'default',
          verb: 'list',
          group: 'security.giantswarm.io',
          resource: 'organizations',
        },
      };
      const accessReviewResponse = await selfSubjectAccessReview(
        client,
        user,
        request
      )();

      if (accessReviewResponse.status?.allowed) {
        canList = true;
      }

      let orgs: string[] = [];
      if (canList) {
        // The user can list all orgs. So list them all and dispatch the action that
        // updates the global state with all the orgs
        const orgListResponse = await getOrganizationList(client, user)();
        orgs = orgListResponse.items.map((o) => getOrganizationUIName(o));
      } else {
        // The user can't list all orgs. So do a selfSubjectRulesReview to figure out
        // which ones they can get.
        const rulesReviewResponse = await selfSubjectRulesReview(
          client,
          user
        )();

        rulesReviewResponse.status?.resourceRules.forEach((rule) => {
          if (
            rule.verbs.includes('get') &&
            rule.resources.includes('organizations')
          ) {
            orgs.push(...rule.resourceNames);
          }
        });

        // We now know what orgs they can get. We still need to fetch them
        // to check if the orgs have a 'ui.giantswarm.io/original-organization-name'
        // annotation.
        const orgGetRequests = orgs.map((orgName) =>
          getOrganization(client, user, orgName)()
        );

        const orgGetResponses = await Promise.all(orgGetRequests);

        orgs = orgGetResponses.map((org) => getOrganizationUIName(org));
      }

      const uniqueOrgs = orgs.filter((v, i, a) => a.indexOf(v) === i);

      const orgsAsIOrganiation: IOrganization[] = uniqueOrgs.map((o) => {
        return {
          id: o,
          members: [],
          credentials: [],
        };
      });

      const organizationsAsMap = orgsAsIOrganiation.reduce(
        (orgAcc: Record<string, IOrganization>, currentOrg: IOrganization) => {
          orgAcc[currentOrg.id] = currentOrg;

          return orgAcc;
        },
        {}
      );

      const currentlySelectedOrganization = getState().main
        .selectedOrganization;
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

      const currentlySelectedOrganization = getState().main
        .selectedOrganization;
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
        `Organization <code>${orgId}</code> deleted`,
        messageType.INFO,
        messageTTL.SHORT
      );

      await dispatch(organizationsLoad());
      dispatch(organizationDeleteSuccess(orgId));

      return true;
    } catch {
      new FlashMessage(
        `Could not delete organization <code>${orgId}</code>.`,
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again or contact support at support@giantswarm.io.'
      );

      dispatch({
        type: ORGANIZATION_DELETE_ERROR,
      });

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
        `Organization <code>${orgId}</code> has been created`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );

      dispatch({
        type: ORGANIZATION_CREATE_SUCCESS,
      });
      await dispatch(organizationsLoad());
    } catch {
      new FlashMessage(
        `Could not create organization <code>${orgId}</code>`,
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again in a moment or contact support at support@giantswarm.io'
      );

      dispatch({
        type: ORGANIZATION_CREATE_ERROR,
      });
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
        `Added <code>${email}</code> to organization <code>${orgId}</code>`,
        messageType.SUCCESS,
        messageTTL.MEDIUM
      );

      await dispatch(organizationsLoad());
      dispatch(modalHide());
    } catch {
      dispatch({
        type: ORGANIZATION_ADD_MEMBER_ERROR,
        orgId,
        errorMessage: `Could not add ${email} to organization ${orgId}.`,
      });
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
        `Removed <code>${email}</code> from organization <code>${orgId}</code>`,
        messageType.INFO,
        messageTTL.MEDIUM
      );

      await dispatch(organizationsLoad());
    } catch {
      new FlashMessage(
        `Error removing <code>${email}</code> from organization <code>${orgId}</code>`,
        messageType.ERROR,
        messageTTL.LONG
      );

      dispatch({
        type: ORGANIZATION_REMOVE_MEMBER_ERROR,
      });
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
    } catch {
      new FlashMessage(
        `Could not load credentials for <code>${orgId}</code>.`,
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again in a moment or contact support at support@giantswarm.io.'
      );

      dispatch({
        type: ORGANIZATION_CREDENTIALS_LOAD_ERROR,
      });
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
    } catch {
      new FlashMessage(
        `Could not set credentials for organization <code>${orgId}</code>.`,
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again in a moment or contact support at support@giantswarm.io.'
      );

      dispatch({
        type: ORGANIZATION_CREDENTIALS_SET_ERROR,
      });
    }
  };
}
