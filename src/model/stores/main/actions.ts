import { CallHistoryMethodAction, push, replace } from 'connected-react-router';
import GiantSwarm from 'giantswarm';
import { Base64 } from 'js-base64';
import { AuthorizationTypes, StatusCodes } from 'model/constants';
import { MainRoutes } from 'model/constants/routes';
import { IAsynchronousDispatch } from 'model/stores/asynchronousAction';
import {
  CLUSTER_SELECT,
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_REQUEST,
  GLOBAL_LOAD_SUCCESS,
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
  VERIFY_PASSWORD_RECOVERY_TOKEN,
} from 'model/stores/main/constants';
import { getLoggedInUser } from 'model/stores/main/selectors';
import { MainActions } from 'model/stores/main/types';
import { IState } from 'model/stores/state';
import { ThunkAction } from 'redux-thunk';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { IGSAPIError } from 'utils/errorUtils';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import {
  fetchUserFromStorage,
  removeUserFromStorage,
  setUserToStorage,
} from 'utils/localStorageUtils';
import MapiAuth, { MapiAuthConnectors } from 'utils/MapiAuth/MapiAuth';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import Passage, {
  IRequestPasswordRecoveryTokenResponse,
  ISetNewPasswordResponse,
  IVerifyPasswordRecoveryTokenResponse,
} from 'utils/passageClient';

import { LoggedInUserTypes } from './types';
import { mapOAuth2UserToUser } from './utils';

export function selectCluster(clusterID: string): MainActions {
  return {
    type: CLUSTER_SELECT,
    clusterID,
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
      if ((err as IGSAPIError).status === StatusCodes.Unauthorized) {
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
        error: String(err),
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
): ThunkAction<Promise<ILoggedInUser>, IState, void, MainActions> {
  return async (dispatch: IAsynchronousDispatch<IState>, getState) => {
    const location = getState().router.location;
    const urlParams = new URLSearchParams(location.search);
    const isLoginResponse = urlParams.has('code') && urlParams.has('state');

    if (isLoginResponse) {
      const user = await auth.handleLoginResponse(window.location.href);
      // Login callbacks are handled by `OAuth2`.

      // Remove state and code from url.
      dispatch(replace(location.pathname));

      if (!user) {
        return Promise.reject(new Error('Failed to process login response.'));
      }

      return Promise.resolve(mapOAuth2UserToUser(user));
    }

    // Try to resume GS user first.
    const user = fetchUserFromStorage();
    if (user) {
      dispatch(loginSuccess(user));

      return Promise.resolve(user);
    }

    const mapiUser = await auth.getLoggedInUser();
    if (mapiUser) {
      // Login callbacks are handled by `OAuth2`.

      return Promise.resolve(mapOAuth2UserToUser(mapiUser));
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
      dispatch(logoutError(String(err)));

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
      dispatch(loginError(String(err)));
      dispatch(push(MainRoutes.Login));

      ErrorReporter.getInstance().notify(err as Error);
    }
  };
}
