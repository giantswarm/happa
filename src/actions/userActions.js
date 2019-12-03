import * as types from './actionTypes';
import { AuthorizationTypes } from 'shared/constants';
import { Base64 } from 'js-base64';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'lib/flash_message';
import { push } from 'connected-react-router';
import _ from 'underscore';
import GiantSwarm from 'giantswarm';

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
    var usersApi = new GiantSwarm.UsersApi();

    if (!getState().app.loggedInUser) {
      dispatch({
        type: types.REFRESH_USER_INFO_ERROR,
        error: 'No logged in user to refresh.',
      });
      throw 'No logged in user to refresh.';
    }

    return usersApi
      .getCurrentUser()
      .then(data => {
        var userData = {
          email: data.email,
          auth: {
            scheme: getState().app.loggedInUser.auth.scheme,
            token: getState().app.loggedInUser.auth.token,
          },
          isAdmin: getState().app.loggedInUser.isAdmin,
        };

        localStorage.setItem('user', JSON.stringify(userData));

        dispatch({
          type: types.REFRESH_USER_INFO_SUCCESS,
          userData: userData,
        });
      })
      .then(getInfo().bind(this, dispatch, getState))
      .catch(error => {
        console.error('Error refreshing user info', error);

        if (error.status === 401) {
          new FlashMessage(
            'Please log in again, as your previously saved credentials appear to be invalid.',
            messageType.WARNING,
            messageTTL.MEDIUM
          );

          this.props.dispatch(push('/login'));
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
        throw error;
      });
  };
}

// auth0login is called when we have a callback result from auth0.
// It then dispatches loginSuccess with the users token and email
// the userReducer takes care of storing this in state.
export function auth0Login(authResult) {
  return function(dispatch) {
    return new Promise(function(resolve) {
      let isAdmin = false;
      if (
        authResult.idTokenPayload['https://giantswarm.io/groups'] ===
        'api-admin'
      ) {
        isAdmin = true;
      }

      var userData = {
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
    let authTokensApi = new GiantSwarm.AuthTokensApi();

    dispatch({
      type: types.LOGIN,
      email: email,
    });

    return authTokensApi
      .createAuthToken({
        email: email,
        password_base64: Base64.encode(password),
      })
      .then(response => {
        let userData = {
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
        console.error('Error trying to log in:', error);

        dispatch(loginError(error));
        dispatch(push('/login'));

        throw error;
      });
  };
}

// giantswarmLogout attempts to delete the user's giantswarm auth token.
// it then dispatches logoutSuccess, which will 'shutdown' happa, and return
// it to the login screen.
export function giantswarmLogout() {
  return function(dispatch, getState) {
    var authToken;
    if (getState().app.loggedInUser) {
      authToken = getState().app.loggedInUser.auth.token;
    } else {
      authToken = undefined;
    }

    var authTokensApi = new GiantSwarm.AuthTokensApi();

    dispatch({
      type: types.LOGOUT,
    });

    return authTokensApi
      .deleteAuthToken('giantswarm ' + authToken)
      .then(() => {
        dispatch(push('/login'));
        return dispatch(logoutSuccess());
      })
      .catch(error => {
        dispatch(push('/login'));
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

    dispatch(push('/login'));

    return null;
  };
}

// getInfo calls the /v4/info/ endpoint and dispatches accordingly to store
// the resulting info into the state.
export function getInfo() {
  return function(dispatch) {
    var infoApi = new GiantSwarm.InfoApi();

    dispatch({
      type: types.INFO_LOAD,
    });

    return infoApi
      .getInfo()
      .then(info => {
        dispatch({
          type: types.INFO_LOAD_SUCCESS,
          info: info,
        });
      })
      .catch(error => {
        console.error('Error loading installation info:', error);

        dispatch({
          type: types.INFO_LOAD_ERROR,
          error: error,
        });

        throw error;
      });
  };
}

// usersLoad
// -----------------
// Loads all users from the Giant Swarm API into state.
// /v4/users/
export function usersLoad() {
  return function(dispatch, getState) {
    var usersApi = new GiantSwarm.UsersApi();

    var alreadyFetching = getState().entities.users.isFetching;

    if (alreadyFetching) {
      return new Promise(resolve => {
        resolve();
      });
    }

    dispatch({ type: types.USERS_LOAD });

    return usersApi
      .getUsers()
      .then(usersArray => {
        var users = {};

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

    var usersApi = new GiantSwarm.UsersApi();

    dispatch({ type: types.USERS_REMOVE_EXPIRATION });

    return usersApi
      .modifyUser(email, { expiry: NEVER_EXPIRES })
      .then(user => {
        dispatch({
          type: types.USERS_REMOVE_EXPIRATION_SUCCESS,
          user,
        });
      })
      .catch(error => {
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
    var usersApi = new GiantSwarm.UsersApi();

    dispatch({ type: types.USERS_DELETE });

    return usersApi
      .deleteUser(email)
      .then(() => {
        dispatch({
          type: types.USERS_DELETE_SUCCESS,
          email,
        });
      })
      .catch(error => {
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
