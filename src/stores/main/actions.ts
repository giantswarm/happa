import { CallHistoryMethodAction, push } from 'connected-react-router';
import GiantSwarm from 'giantswarm';
import { Base64 } from 'js-base64';
import { IAuthResult } from 'lib/auth0';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import Passage, {
  IRequestPasswordRecoveryTokenResponse,
  ISetNewPasswordResponse,
  IVerifyPasswordRecoveryTokenResponse,
} from 'lib/passageClient';
import { GenericResponse } from 'model/clients/GenericResponse';
import { GiantSwarmClient } from 'model/clients/GiantSwarmClient';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { IState } from 'reducers/types';
import { ThunkAction } from 'redux-thunk';
import { AuthorizationTypes, StatusCodes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
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
  VERIFY_PASSWORD_RECOVERY_TOKEN,
} from 'stores/main/constants';
import { selectAuthToken } from 'stores/main/selectors';
import { MainActions } from 'stores/main/types';

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
      const [authToken, authScheme] = await selectAuthToken(dispatch)(
        getState()
      );
      const httpClient = new GiantSwarmClient(authToken, authScheme);
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
    const loggedInUser = getState().main.loggedInUser;
    if (!loggedInUser) {
      dispatch({
        type: REFRESH_USER_INFO_ERROR,
        error: 'No logged in user to refresh.',
      });

      return Promise.reject(new Error('No logged in user to refresh.'));
    }

    try {
      dispatch({ type: REFRESH_USER_INFO_REQUEST });
      const usersApi = new GiantSwarm.UsersApi();
      const response = await usersApi.getCurrentUser();

      dispatch({
        type: REFRESH_USER_INFO_SUCCESS,
        email: response.email,
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
          ? AppRoutes.AdminLogin
          : AppRoutes.Login;

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

export function auth0Login(
  authResult: IAuthResult
): ThunkAction<Promise<void>, IState, void, MainActions> {
  return async (dispatch) => {
    return new Promise((resolve) => {
      let isAdmin = false;
      if (
        authResult.idTokenPayload['https://giantswarm.io/groups'] ===
        'api-admin'
      ) {
        isAdmin = true;
      }

      const userData: ILoggedInUser = {
        email: authResult.idTokenPayload.email,
        auth: {
          scheme: AuthorizationTypes.BEARER,
          token: authResult.accessToken,
        },
        isAdmin,
      };

      localStorage.setItem('user', JSON.stringify(userData));
      dispatch(loginSuccess(userData));

      resolve();
    });
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
      };

      localStorage.setItem('user', JSON.stringify(userData));
      dispatch(loginSuccess(userData));

      return Promise.resolve();
    } catch (err) {
      const message = (err as Error).message ?? (err as string);
      dispatch(loginError(message));
      dispatch(push(AppRoutes.Login));

      return Promise.reject(err);
    }
  };
}

export function giantswarmLogout(): ThunkAction<
  Promise<void>,
  IState,
  void,
  MainActions | CallHistoryMethodAction
> {
  return async (dispatch) => {
    try {
      dispatch({ type: LOGOUT_REQUEST });

      const authTokensApi = new GiantSwarm.AuthTokensApi();
      await authTokensApi.deleteAuthToken();

      dispatch(push(AppRoutes.Login));
      dispatch(logoutSuccess());

      return Promise.resolve();
    } catch (err) {
      dispatch(push(AppRoutes.Login));
      dispatch(logoutError(err));

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
