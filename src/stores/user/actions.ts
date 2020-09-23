import {
  INFO_LOAD_ERROR,
  INFO_LOAD_REQUEST,
  INFO_LOAD_SUCCESS,
  UNAUTHORIZED,
} from 'actions/actionTypes';
import { CallHistoryMethodAction, push } from 'connected-react-router';
import GiantSwarm from 'giantswarm';
import { Base64 } from 'js-base64';
import { IAuthResult } from 'lib/auth0';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'lib/flashMessage';
import { GiantSwarmClient } from 'model/clients/GiantSwarmClient';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { IState } from 'reducers/types';
import { ThunkAction } from 'redux-thunk';
import { AuthorizationTypes, StatusCodes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import {
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

// refreshUserInfo performs the /v4/user/ call and updates what Happa knows
// about the user based on the response.
export function refreshUserInfo(): ThunkAction<
  void,
  IState,
  void,
  UserActions | CallHistoryMethodAction
> {
  return (dispatch, getState) => {
    const usersApi = new GiantSwarm.UsersApi();
    const loggedInUser = getState().main.loggedInUser;

    if (!loggedInUser) {
      dispatch({
        type: REFRESH_USER_INFO_ERROR,
        error: 'No logged in user to refresh.',
      });

      throw new Error('No logged in user to refresh.');
    }

    dispatch({ type: REFRESH_USER_INFO_REQUEST });

    return usersApi
      .getCurrentUser()
      .then((data) => {
        dispatch({
          type: REFRESH_USER_INFO_SUCCESS,
          email: data.email,
        });
      })
      .catch((error) => {
        if (error.status === StatusCodes.Unauthorized) {
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
          error: error,
        });
      });
  };
}

// auth0login is called when we have a callback result from auth0.
// It then dispatches loginSuccess with the users token and email
// the userReducer takes care of storing this in state.
export function auth0Login(
  authResult: IAuthResult
): ThunkAction<void, IState, void, UserActions> {
  return (dispatch) => {
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
      resolve(dispatch(loginSuccess(userData)));
    });
  };
}

// giantswarmLogin attempts to log the user in using email and password.
// It then calls /v4/user/ to get user details. This step could be skipped since
// we actually know the email (user used it to log in)
// It then dispatches loginSuccess with the users token and email
// the userReducer takes care of storing this in state.
export function giantswarmLogin(
  email: string,
  password: string
): ThunkAction<void, IState, void, UserActions | CallHistoryMethodAction> {
  return function (dispatch) {
    const authTokensApi = new GiantSwarm.AuthTokensApi();

    dispatch({
      type: LOGIN_REQUEST,
      email: email,
    });

    return authTokensApi
      .createAuthToken({
        email: email,
        password_base64: Base64.encode(password),
      })
      .then((response) => {
        const userData = {
          email: email,
          auth: {
            scheme: 'giantswarm',
            token: response.auth_token,
          },
        };

        return userData;
      })
      .then((userData) => {
        const user: ILoggedInUser = {
          ...(userData as ILoggedInUser),
          isAdmin: false,
        };
        localStorage.setItem('user', JSON.stringify(user));
        dispatch(loginSuccess(user));

        return userData;
      })
      .catch((error) => {
        dispatch(loginError(error));
        dispatch(push(AppRoutes.Login));

        throw error;
      });
  };
}

// giantswarmLogout attempts to delete the user's giantswarm auth token.
// it then dispatches logoutSuccess, which will 'shutdown' happa, and return
// it to the login screen.
export function giantswarmLogout(): ThunkAction<
  void,
  IState,
  void,
  UserActions | CallHistoryMethodAction
> {
  return function (dispatch) {
    const authTokensApi = new GiantSwarm.AuthTokensApi();

    dispatch({ type: LOGOUT_REQUEST });

    return authTokensApi
      .deleteAuthToken()
      .then(() => {
        dispatch(push(AppRoutes.Login));

        return dispatch(logoutSuccess());
      })
      .catch((error) => {
        dispatch(push(AppRoutes.Login));
        dispatch(logoutError(error));
        throw error;
      });
  };
}

/**
 * To be called whenever a API call results in a "401 Unauthorized" error.
 *
 * It will dispatch the UNAUTHORIZED action, as well as add a
 * flash message to let the user know we couldn't authenticate them.
 */
export function unauthorized(): ThunkAction<
  void,
  IState,
  void,
  UserActions | CallHistoryMethodAction
> {
  return function (dispatch) {
    // Clear any lingering flash messages that would pop up due to failed
    // requests.
    clearQueues();

    new FlashMessage(
      'Not authorized for API requests.',
      messageType.ERROR,
      messageTTL.MEDIUM,
      'Seems like you have been logged out. Please log in again.'
    );

    dispatch({ type: UNAUTHORIZED });
    dispatch(push(AppRoutes.Login));

    return null;
  };
}

// getInfo calls the /v4/info/ endpoint and dispatches accordingly to store
// the resulting info into the state.
export function getInfo(): ThunkAction<void, IState, void, UserActions> {
  return async function (dispatch, getState) {
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

// usersLoad
// -----------------
// Loads all users from the Giant Swarm API into state.
// /v4/users/
export function usersLoad(): ThunkAction<void, IState, void, UserActions> {
  return function (dispatch, getState) {
    const usersApi = new GiantSwarm.UsersApi();

    const alreadyFetching = getState().entities.users.isFetching;

    if (alreadyFetching) {
      return new Promise((resolve) => {
        resolve();
      });
    }

    dispatch({ type: USERS_LOAD_REQUEST });

    return usersApi
      .getUsers()
      .then((usersArray) => {
        const users: Record<string, IUser> = {};

        for (const user of usersArray) {
          users[user.email] = {
            ...user,
            emaildomain: user.email.split('@')[1],
          };
        }

        dispatch({
          type: USERS_LOAD_SUCCESS,
          users,
        });
      })
      .catch(() => {
        new FlashMessage(
          'Something went wrong while trying to load all users',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again.'
        );

        dispatch({
          type: USERS_LOAD_ERROR,
        });
      });
  };
}

// userRemoveExpiration
// ----------------
// Removes the expiration date from a given user.
export function userRemoveExpiration(
  email: string
): ThunkAction<void, IState, void, UserActions> {
  return function (dispatch) {
    const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

    const usersApi = new GiantSwarm.UsersApi();

    dispatch({ type: USERS_REMOVE_EXPIRATION_REQUEST });

    return usersApi
      .modifyUser(email, {
        expiry: NEVER_EXPIRES,
      } as GiantSwarm.V4ModifyUserRequest)
      .then((user) => {
        const newUser: IUser = {
          ...user,
          emaildomain: user.email.split('@')[1],
        };

        dispatch({
          type: USERS_REMOVE_EXPIRATION_SUCCESS,
          user: newUser,
        });
      })
      .catch(() => {
        new FlashMessage(
          'Something went wrong while trying to remove expiration from this user',
          messageType.ERROR,
          messageTTL.MEDIUM
        );

        dispatch({
          type: USERS_REMOVE_EXPIRATION_ERROR,
        });
      });
  };
}

// userDelete
// ----------------
// Deletes the given user.
export function userDelete(
  email: string
): ThunkAction<void, IState, void, UserActions> {
  return function (dispatch) {
    const usersApi = new GiantSwarm.UsersApi();

    dispatch({ type: USERS_DELETE_REQUEST });

    return usersApi
      .deleteUser(email)
      .then(() => {
        dispatch({
          type: USERS_DELETE_SUCCESS,
          email,
        });
      })
      .catch(() => {
        new FlashMessage(
          'Something went wrong while trying to delete this user',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        dispatch({
          type: USERS_DELETE_ERROR,
        });
      });
  };
}
