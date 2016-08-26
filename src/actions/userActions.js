'use strict';

// LOGIN
// LOGOUT

import * as types from './actionTypes';
import GiantSwarm from '../lib/giantswarm_client_wrapper';

export function loginSuccess(userData) {
  return {
    type: types.LOGIN_SUCCESS,
    userData
  };
}

export function loginError(errorMessage) {
  return {
    type: types.LOGIN_ERROR,
    errorMessage
  };
}

export function logoutSuccess() {
  return {
    type: types.LOGOUT_SUCCESS
  };
}

export function logoutError(errorMessage) {
  return {
    type: types.LOGOUT_ERROR,
    errorMessage
  };
}

export function refreshUserInfo() {
  return function(dispatch, getState) {
    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    return giantSwarm.user()
    .then((data) => {
      var userData = {
        email: data.result.email,
        username: data.result.username,
        authToken: giantSwarm.authToken
      };

      dispatch({
        type: types.REFRESH_USER_INFO_SUCCESS,
        userData: userData
      });
    })
    .catch((error) => {
      dispatch({
        type: types.REFRESH_USER_INFO_ERROR,
        error: error
      });
      throw(error);
    });
  };
}


export function login(email, password) {
  return function(dispatch, getState) {
    var giantSwarm = new GiantSwarm.Client();
    dispatch({
      type: types.LOGIN,
      email: email
    });

    return giantSwarm.authenticate({
      usernameOrEmail: email,
      password: password
    })
    .then((response) => {
      if (response.result === true) {
        return true;
      } else {
        throw('Invalid email and/or password');
      }
    })
    .then(giantSwarm.user.bind(giantSwarm))
    .then((data) => {
      var userData = {
        email: data.result.email,
        username: data.result.username,
        authToken: giantSwarm.authToken
      };

      return userData;
    })
    .then((userData) => {
      dispatch(loginSuccess(userData));
      return userData;
    })
    .catch(error => {
      dispatch(loginError(error));
      throw(error);
    });
  };
}

export function logout() {
  return function(dispatch, getState) {
    var authToken = getState().app.loggedInUser.authToken;
    var giantSwarm = new GiantSwarm.Client(authToken);

    dispatch({
      type: types.LOGOUT
    });

    return giantSwarm.logout()
    .then(() => {
      dispatch(logoutSuccess());
    })
    .catch((error) => {
      dispatch(logoutError(error));
    });
  };
}