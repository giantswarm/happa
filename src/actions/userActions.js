import { push } from 'connected-react-router';
import GiantSwarm from 'giantswarm';
import { Base64 } from 'js-base64';
import * as errors from 'lib/errors';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'lib/flashMessage';
import { GiantSwarmClient } from 'model/clients';
import { getInstallationInfo } from 'model/services/giantSwarm';
import { selectAuthToken } from 'selectors/authSelectors';
import { AuthorizationTypes, StatusCodes } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import _ from 'underscore';

import * as types from './actionTypes';

export function loginSuccess(userData) {
  return {
    type: types.LOGIN_SUCCESS,
    userData,
  };
}

export function loginError(errorMessage) {
  return {
    type: types.LOGIN_ERROR,
    errorMessage,
  };
}

export function logoutSuccess() {
  return {
    type: types.LOGOUT_SUCCESS,
  };
}

export function logoutError(errorMessage) {
  return {
    type: types.LOGOUT_ERROR,
    errorMessage,
  };
}

// refreshUserInfo performs the /v4/user/ call and updates what Happa knows
// about the user based on the response.
export function refreshUserInfo() {
  return function(dispatch, getState) {
    const usersApi = new GiantSwarm.UsersApi();
    const loggedInUser = getState().main.loggedInUser;

    if (!loggedInUser) {
      dispatch({
        type: types.REFRESH_USER_INFO_ERROR,
        error: 'No logged in user to refresh.',
      });

      throw new Error('No logged in user to refresh.');
    }

    dispatch({ type: types.REFRESH_USER_INFO_REQUEST });

    return usersApi
      .getCurrentUser()
      .then(data => {
        dispatch({
          type: types.REFRESH_USER_INFO_SUCCESS,
          email: data.email,
        });
      })
      .catch(error => {
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
          type: types.REFRESH_USER_INFO_ERROR,
          error: error,
        });
      });
  };
}

// auth0login is called when we have a callback result from auth0.
// It then dispatches loginSuccess with the users token and email
// the userReducer takes care of storing this in state.
export function auth0Login(authResult) {
  return function(dispatch) {
    return new Promise(resolve => {
      let isAdmin = false;
      if (
        authResult.idTokenPayload['https://giantswarm.io/groups'] ===
        'api-admin'
      ) {
        isAdmin = true;
      }

      const userData = {
        email: authResult.idTokenPayload.email,
        auth: {
          scheme: AuthorizationTypes.BEARER,
          token: authResult.accessToken,
        },
        isAdmin: isAdmin,
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
export function giantswarmLogin(email, password) {
  return function(dispatch) {
    const authTokensApi = new GiantSwarm.AuthTokensApi();

    dispatch({
      type: types.LOGIN_REQUEST,
      email: email,
    });

    return authTokensApi
      .createAuthToken({
        email: email,
        password_base64: Base64.encode(password),
      })
      .then(response => {
        const userData = {
          email: email,
          auth: {
            scheme: 'giantswarm',
            token: response.auth_token,
          },
        };

        return userData;
      })
      .then(userData => {
        localStorage.setItem('user', JSON.stringify(userData));
        dispatch(loginSuccess(userData));

        return userData;
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Error trying to log in:', error);

        dispatch(loginError(error));
        dispatch(push(AppRoutes.Login));

        throw error;
      });
  };
}

// giantswarmLogout attempts to delete the user's giantswarm auth token.
// it then dispatches logoutSuccess, which will 'shutdown' happa, and return
// it to the login screen.
export function giantswarmLogout() {
  return function(dispatch, getState) {
    let authToken = null;

    if (getState().main.loggedInUser) {
      authToken = getState().main.loggedInUser.auth.token;
    }

    const authTokensApi = new GiantSwarm.AuthTokensApi();

    dispatch({ type: types.LOGOUT_REQUEST });

    return authTokensApi
      .deleteAuthToken(`giantswarm ${authToken}`)
      .then(() => {
        dispatch(push(AppRoutes.Login));

        return dispatch(logoutSuccess());
      })
      .catch(error => {
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
export function unauthorized() {
  return function(dispatch) {
    // Clear any lingering flash messages that would pop up due to failed
    // requests.
    clearQueues();

    // Let the user know he has been logged out due to a probably expired
    // or deleted token.
    // TODO: Avoid this message firing multiple times from different queries,
    // maybe by using a custom queue with length 1.
    // See https://ned.im/noty/#/api?id=api-static-methods
    new FlashMessage(
      'Not authorized for API requests.',
      messageType.ERROR,
      messageTTL.MEDIUM,
      'Seems like you have been logged out. Please log in again.'
    );

    dispatch({
      type: types.UNAUTHORIZED,
    });

    dispatch(push(AppRoutes.Login));

    return null;
  };
}

// getInfo calls the /v4/info/ endpoint and dispatches accordingly to store
// the resulting info into the state.
export function getInfo() {
  return async function(dispatch, getState) {
    dispatch({ type: types.INFO_LOAD_REQUEST });

    const err = new Error('Something went terribly wrong!');

    const someError = errors.Error.createFromError(err);
    someError.report();

    console.log(err);

    try {
      const [authToken, authScheme] = await selectAuthToken(
        dispatch,
        getState()
      );
      const httpClient = new GiantSwarmClient(authToken, authScheme);
      const infoRes = await getInstallationInfo(httpClient);

      dispatch({
        type: types.INFO_LOAD_SUCCESS,
        info: infoRes.data,
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading installation info:', error);

      dispatch({
        type: types.INFO_LOAD_ERROR,
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
export function usersLoad() {
  return function(dispatch, getState) {
    const usersApi = new GiantSwarm.UsersApi();

    const alreadyFetching = getState().entities.users.isFetching;

    if (alreadyFetching) {
      return new Promise(resolve => {
        resolve();
      });
    }

    dispatch({ type: types.USERS_LOAD_REQUEST });

    return usersApi
      .getUsers()
      .then(usersArray => {
        const users = {};

        _.each(usersArray, user => {
          user.emaildomain = user.email.split('@')[1];
          users[user.email] = user;
        });

        dispatch({
          type: types.USERS_LOAD_SUCCESS,
          users,
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);

        new FlashMessage(
          'Something went wrong while trying to load all users',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again.'
        );

        dispatch({
          type: types.USERS_LOAD_ERROR,
        });
      });
  };
}

// userRemoveExpiration
// ----------------
// Removes the expiration date from a given user.
export function userRemoveExpiration(email) {
  return function(dispatch) {
    const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

    const usersApi = new GiantSwarm.UsersApi();

    dispatch({ type: types.USERS_REMOVE_EXPIRATION_REQUEST });

    return usersApi
      .modifyUser(email, { expiry: NEVER_EXPIRES })
      .then(user => {
        dispatch({
          type: types.USERS_REMOVE_EXPIRATION_SUCCESS,
          user,
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Error removing user expiration:', error);

        new FlashMessage(
          'Something went wrong while trying to remove expiration from this user',
          messageType.ERROR,
          messageTTL.MEDIUM
        );

        dispatch({
          type: types.USERS_REMOVE_EXPIRATION_ERROR,
        });
      });
  };
}

// userDelete
// ----------------
// Deletes the given user.
export function userDelete(email) {
  return function(dispatch) {
    const usersApi = new GiantSwarm.UsersApi();

    dispatch({ type: types.USERS_DELETE_REQUEST });

    return usersApi
      .deleteUser(email)
      .then(() => {
        dispatch({
          type: types.USERS_DELETE_SUCCESS,
          email,
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error('Error when deleting user:', error);

        new FlashMessage(
          'Something went wrong while trying to delete this user',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        dispatch({
          type: types.USERS_DELETE_ERROR,
        });
      });
  };
}
