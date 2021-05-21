import { CallHistoryMethodAction, push, replace } from 'connected-react-router';
import GiantSwarm from 'giantswarm';
import { Base64 } from 'js-base64';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import MapiAuth, { MapiAuthConnectors } from 'lib/MapiAuth/MapiAuth';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import Passage, {
  IRequestPasswordRecoveryTokenResponse,
  ISetNewPasswordResponse,
  IVerifyPasswordRecoveryTokenResponse,
} from 'lib/passageClient';
import { GenericResponse } from 'model/clients/GenericResponse';
import { GiantSwarmClient } from 'model/clients/GiantSwarmClient';
import { HttpClientImpl } from 'model/clients/HttpClient';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import * as authorizationv1 from 'model/services/mapi/authorizationv1';
import { ThunkAction } from 'redux-thunk';
import { AuthorizationTypes, StatusCodes } from 'shared/constants';
import { MainRoutes } from 'shared/constants/routes';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import {
  CLUSTER_SELECT,
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_REQUEST,
  GLOBAL_LOAD_SUCCESS,
  INFO_LOAD_ERROR,
  INFO_LOAD_REQUEST,
  INFO_LOAD_SUCCESS,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_ERROR,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  REFRESH_USER_INFO_ERROR,
  REFRESH_USER_INFO_REQUEST,
  REFRESH_USER_INFO_SUCCESS,
  REQUEST_PASSWORD_RECOVERY_TOKEN_REQUEST,
  SET_NEW_PASSWORD,
  SET_PERMISSIONS,
  VERIFY_PASSWORD_RECOVERY_TOKEN,
} from 'stores/main/constants';
import { getLoggedInUser } from 'stores/main/selectors';
import { MainActions } from 'stores/main/types';
import { selectOrganizations } from 'stores/organization/selectors';
import { IState } from 'stores/state';
import {
  fetchUserFromStorage,
  removeUserFromStorage,
  setUserToStorage,
} from 'utils/localStorageUtils';

import { LoggedInUserTypes } from './types';
import { computePermissions, getNamespaceFromOrgName } from './utils';

export function selectCluster(clusterID: string): MainActions {
  return {
    type: CLUSTER_SELECT,
    clusterID,
  };
}

export function getInfo(): ThunkAction<
  Promise<void>,
  IState,
  void,
  MainActions
> {
  return async (dispatch, getState) => {
    dispatch({ type: INFO_LOAD_REQUEST });

    try {
      const user = getLoggedInUser(getState())!;
      const httpClient = new GiantSwarmClient(
        user.auth.token,
        user.auth.scheme
      );
      const infoRes = await getInstallationInfo(httpClient);

      dispatch({
        type: INFO_LOAD_SUCCESS,
        info: infoRes.data,
      });

      return Promise.resolve();
    } catch (err) {
      dispatch({
        type: INFO_LOAD_ERROR,
        error: (err as GenericResponse<string>).data,
      });

      return Promise.reject(err);
    }
  };
}

export function globalLoadStart(): MainActions {
  return { type: GLOBAL_LOAD_REQUEST };
}

export function globalLoadFinish(): MainActions {
  return { type: GLOBAL_LOAD_SUCCESS };
}

export function globalLoadError(): MainActions {
  return { type: GLOBAL_LOAD_ERROR };
}

export function loginSuccess(userData: ILoggedInUser): MainActions {
  const defaultClient = GiantSwarm.ApiClient.instance;
  const defaultClientAuth =
    defaultClient.authentications.AuthorizationHeaderToken;
  defaultClientAuth.apiKey = userData.auth.token;
  defaultClientAuth.apiKeyPrefix = userData.auth.scheme;

  return {
    type: LOGIN_SUCCESS,
    userData,
  };
}

export function loginError(errorMessage: string): MainActions {
  return {
    type: LOGIN_ERROR,
    errorMessage,
  };
}

export function logoutSuccess(): MainActions {
  return { type: LOGOUT_SUCCESS };
}

export function logoutError(errorMessage: string): MainActions {
  return {
    type: LOGOUT_ERROR,
    errorMessage,
  };
}

export function refreshUserInfo(): ThunkAction<
  Promise<void>,
  IState,
  void,
  MainActions | CallHistoryMethodAction
> {
  return async (dispatch, getState) => {
    const loggedInUser = getLoggedInUser(getState());
    if (!loggedInUser) {
      dispatch({
        type: REFRESH_USER_INFO_ERROR,
        error: 'No logged in user to refresh.',
      });

      return Promise.reject(new Error('No logged in user to refresh.'));
    }

    if (loggedInUser.type !== LoggedInUserTypes.GS) {
      return Promise.resolve();
    }

    try {
      dispatch({ type: REFRESH_USER_INFO_REQUEST });
      const usersApi = new GiantSwarm.UsersApi();
      const response = await usersApi.getCurrentUser();

      const newUser = Object.assign({}, loggedInUser, {
        email: response.email,
      });
      setUserToStorage(newUser);

      dispatch({
        type: REFRESH_USER_INFO_SUCCESS,
        loggedInUser: newUser,
      });

      return Promise.resolve();
    } catch (err) {
      if (err.status === StatusCodes.Unauthorized) {
        new FlashMessage(
          'Please log in again, as your previously saved credentials appear to be invalid.',
          messageType.WARNING,
          messageTTL.MEDIUM
        );
        const redirectPath = loggedInUser.isAdmin
          ? MainRoutes.AdminLogin
          : MainRoutes.Login;

        dispatch(push(redirectPath));
      } else {
        new FlashMessage(
          'Something went wrong while trying to load user and organization information.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again in a moment or contact support: support@giantswarm.io'
        );
      }

      dispatch({
        type: REFRESH_USER_INFO_ERROR,
        error: err,
      });

      return Promise.resolve();
    }
  };
}

export function giantswarmLogin(
  email: string,
  password: string
): ThunkAction<
  Promise<void>,
  IState,
  void,
  MainActions | CallHistoryMethodAction
> {
  return async (dispatch) => {
    try {
      dispatch({
        type: LOGIN_REQUEST,
        email: email,
      });

      const authTokensApi = new GiantSwarm.AuthTokensApi();
      const response = await authTokensApi.createAuthToken({
        email,
        password_base64: Base64.encode(password),
      });
      const userData: ILoggedInUser = {
        email,
        auth: {
          scheme: AuthorizationTypes.GS,
          token: response.auth_token,
        },
        isAdmin: false,
        type: LoggedInUserTypes.GS,
      };

      setUserToStorage(userData);
      dispatch(loginSuccess(userData));

      return Promise.resolve();
    } catch (err) {
      const message = (err as Error).message ?? (err as string);
      dispatch(loginError(message));
      dispatch(push(MainRoutes.Login));

      return Promise.reject(err);
    }
  };
}

export function requestPasswordRecoveryToken(
  email: string
): ThunkAction<
  Promise<IRequestPasswordRecoveryTokenResponse>,
  IState,
  void,
  MainActions
> {
  return (dispatch) => {
    dispatch({
      type: REQUEST_PASSWORD_RECOVERY_TOKEN_REQUEST,
    });

    const passage = new Passage({ endpoint: window.config.passageEndpoint });

    return passage.requestPasswordRecoveryToken({ email });
  };
}

export function verifyPasswordRecoveryToken(
  email: string,
  token: string
): ThunkAction<
  Promise<IVerifyPasswordRecoveryTokenResponse>,
  IState,
  void,
  MainActions
> {
  return (dispatch) => {
    dispatch({
      type: VERIFY_PASSWORD_RECOVERY_TOKEN,
    });

    const passage = new Passage({ endpoint: window.config.passageEndpoint });

    return passage.verifyPasswordRecoveryToken({ email, token });
  };
}

export function setNewPassword(
  email: string,
  token: string,
  password: string
): ThunkAction<Promise<ISetNewPasswordResponse>, IState, void, MainActions> {
  return (dispatch) => {
    dispatch({
      type: SET_NEW_PASSWORD,
    });

    const passage = new Passage({ endpoint: window.config.passageEndpoint });

    return passage.setNewPassword({ email, token, password });
  };
}

export function resumeLogin(
  auth: IOAuth2Provider
): ThunkAction<Promise<void>, IState, void, MainActions> {
  return async (dispatch: IAsynchronousDispatch<IState>, getState) => {
    const location = getState().router.location;
    const urlParams = new URLSearchParams(location.search);
    const isLoginResponse = urlParams.has('code') && urlParams.has('state');

    if (isLoginResponse) {
      await auth.handleLoginResponse(window.location.href);
      // Login callbacks are handled by `OAuth2`.

      // Remove state and code from url.
      dispatch(replace(location.pathname));

      return Promise.resolve();
    }

    // Try to resume GS user first.
    const user = fetchUserFromStorage();
    if (user) {
      dispatch(loginSuccess(user));

      return Promise.resolve();
    }

    const mapiUser = await auth.getLoggedInUser();
    if (mapiUser) {
      // Login callbacks are handled by `OAuth2`.

      return Promise.resolve();
    }

    return Promise.reject(new Error('You are not logged in.'));
  };
}

export function logout(
  auth: IOAuth2Provider
): ThunkAction<
  Promise<void>,
  IState,
  void,
  MainActions | CallHistoryMethodAction
> {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: LOGOUT_REQUEST });
      dispatch(push(MainRoutes.Login));

      const user = getLoggedInUser(getState());
      if (!user) {
        dispatch(logoutSuccess());

        return Promise.resolve();
      }

      switch (user.type) {
        case LoggedInUserTypes.GS: {
          const authTokensApi = new GiantSwarm.AuthTokensApi();
          await authTokensApi.deleteAuthToken();

          dispatch(logoutSuccess());

          break;
        }
        case LoggedInUserTypes.MAPI:
          await auth.logout();

          break;
      }

      return Promise.resolve();
    } catch (err) {
      dispatch(logoutError(err));

      return Promise.reject(err);
    }
  };
}

export function mapiLogin(
  auth: MapiAuth,
  connector?: MapiAuthConnectors
): ThunkAction<
  Promise<void>,
  IState,
  void,
  MainActions | CallHistoryMethodAction
> {
  return async (dispatch) => {
    try {
      // Remove other types of users from cache.
      removeUserFromStorage();
      await auth.attemptLogin(connector);
    } catch (err) {
      dispatch(loginError(err.message));
      dispatch(push(MainRoutes.Login));

      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function fetchPermissions(
  auth: IOAuth2Provider
): ThunkAction<Promise<void>, IState, void, MainActions> {
  return async (dispatch, getState) => {
    const orgNames = Object.keys(selectOrganizations()(getState()));

    const namespaces = orgNames.map(getNamespaceFromOrgName);
    // Also get permissions for the default namespace.
    namespaces.push('default');

    const requests = namespaces.map(async (namespace) => {
      const client = new HttpClientImpl();

      const rulesReview: authorizationv1.ISelfSubjectRulesReview = {
        apiVersion: 'authorization.k8s.io/v1',
        kind: 'SelfSubjectRulesReview',
        spec: {
          namespace,
        },
      } as authorizationv1.ISelfSubjectRulesReview;

      const review = await authorizationv1.createSelfSubjectRulesReview(
        client,
        auth,
        rulesReview
      );

      return [namespace, review] as [typeof namespace, typeof review];
    });

    const reviews = await Promise.all(requests);
    const permissions = computePermissions(reviews);

    dispatch(setPermissions(permissions));
  };
}

export function setPermissions(permissions: IPermissionMap): MainActions {
  return {
    type: SET_PERMISSIONS,
    permissions,
  };
}
