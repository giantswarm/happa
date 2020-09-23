import { CallHistoryMethodAction, push } from 'connected-react-router';
import GiantSwarm from 'giantswarm';
import { Base64 } from 'js-base64';
import { IAuthResult } from 'lib/auth0';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { GiantSwarmClient } from 'model/clients/GiantSwarmClient';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { IState } from 'reducers/types';
import { ThunkAction } from 'redux-thunk';
import { AuthorizationTypes, StatusCodes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import {
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
  USERS_DELETE_ERROR,
  USERS_DELETE_REQUEST,
  USERS_DELETE_SUCCESS,
  USERS_LOAD_ERROR,
  USERS_LOAD_REQUEST,
  USERS_LOAD_SUCCESS,
  USERS_REMOVE_EXPIRATION_ERROR,
  USERS_REMOVE_EXPIRATION_REQUEST,
  USERS_REMOVE_EXPIRATION_SUCCESS,
} from 'stores/user/constants';
import { selectAuthToken } from 'stores/user/selectors';
import { UserActions } from 'stores/user/types';

export function loginSuccess(userData: ILoggedInUser): UserActions {
  return {
    type: LOGIN_SUCCESS,
    userData,
  };
}

export function loginError(errorMessage: string): UserActions {
  return {
    type: LOGIN_ERROR,
    errorMessage,
  };
}

export function logoutSuccess(): UserActions {
  return { type: LOGOUT_SUCCESS };
}

export function logoutError(errorMessage: string): UserActions {
  return {
    type: LOGOUT_ERROR,
    errorMessage,
  };
}

export function refreshUserInfo(): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions | CallHistoryMethodAction
> {
  return async (dispatch, getState) => {
    const loggedInUser = getState().main.loggedInUser;
    if (!loggedInUser) {
      dispatch({
        type: REFRESH_USER_INFO_ERROR,
        error: 'No logged in user to refresh.',
      });

      throw new Error('No logged in user to refresh.');
    }

    try {
      dispatch({ type: REFRESH_USER_INFO_REQUEST });
      const usersApi = new GiantSwarm.UsersApi();
      const response = await usersApi.getCurrentUser();

      dispatch({
        type: REFRESH_USER_INFO_SUCCESS,
        email: response.email,
      });
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
    }
  };
}

export function auth0Login(
  authResult: IAuthResult
): ThunkAction<Promise<void>, IState, void, UserActions> {
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
  UserActions | CallHistoryMethodAction
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
    } catch (err) {
      const message = (err as Error).message ?? (err as string);
      dispatch(loginError(message));
      dispatch(push(AppRoutes.Login));

      throw err;
    }
  };
}

export function giantswarmLogout(): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions | CallHistoryMethodAction
> {
  return async (dispatch) => {
    try {
      dispatch({ type: LOGOUT_REQUEST });

      const authTokensApi = new GiantSwarm.AuthTokensApi();
      await authTokensApi.deleteAuthToken();

      dispatch(push(AppRoutes.Login));
      dispatch(logoutSuccess());
    } catch (err) {
      dispatch(push(AppRoutes.Login));
      dispatch(logoutError(err));

      throw err;
    }
  };
}

export function getInfo(): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions
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
    } catch (error) {
      dispatch({
        type: INFO_LOAD_ERROR,
        error: error.data,
      });

      throw error;
    }
  };
}

export function usersLoad(): ThunkAction<
  Promise<void>,
  IState,
  void,
  UserActions
> {
  return async (dispatch, getState) => {
    try {
      const alreadyFetching = getState().entities.users.isFetching;
      if (alreadyFetching) {
        return;
      }

      dispatch({ type: USERS_LOAD_REQUEST });

      const usersApi = new GiantSwarm.UsersApi();
      const response = await usersApi.getUsers();

      const users = Array.from(response).reduce(
        (agg: Record<string, IUser>, curr: GiantSwarm.V4UserListItem) => {
          agg[curr.email] = {
            ...curr,
            emaildomain: curr.email.split('@')[1],
          };

          return agg;
        },
        {}
      );

      dispatch({
        type: USERS_LOAD_SUCCESS,
        users,
      });
    } catch {
      new FlashMessage(
        'Something went wrong while trying to load all users',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again.'
      );

      dispatch({
        type: USERS_LOAD_ERROR,
      });
    }
  };
}

export function userRemoveExpiration(
  email: string
): ThunkAction<Promise<void>, IState, void, UserActions> {
  return async (dispatch) => {
    try {
      const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

      dispatch({ type: USERS_REMOVE_EXPIRATION_REQUEST });
      const usersApi = new GiantSwarm.UsersApi();
      const response = await usersApi.modifyUser(email, {
        expiry: NEVER_EXPIRES,
      } as GiantSwarm.V4ModifyUserRequest);

      const user: IUser = {
        ...response,
        emaildomain: response.email.split('@')[1],
      };

      dispatch({
        type: USERS_REMOVE_EXPIRATION_SUCCESS,
        user,
      });
    } catch {
      new FlashMessage(
        'Something went wrong while trying to remove expiration from this user',
        messageType.ERROR,
        messageTTL.MEDIUM
      );

      dispatch({
        type: USERS_REMOVE_EXPIRATION_ERROR,
      });
    }
  };
}

export function userDelete(
  email: string
): ThunkAction<Promise<void>, IState, void, UserActions> {
  return async (dispatch) => {
    try {
      dispatch({ type: USERS_DELETE_REQUEST });

      const usersApi = new GiantSwarm.UsersApi();
      await usersApi.deleteUser(email);

      dispatch({
        type: USERS_DELETE_SUCCESS,
        email,
      });
    } catch {
      new FlashMessage(
        'Something went wrong while trying to delete this user',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      dispatch({
        type: USERS_DELETE_ERROR,
      });
    }
  };
}
