'use strict';

import { flashAdd } from './flashMessageActions';
import React from 'react';
import * as types from './actionTypes';
import GiantSwarm from '../lib/giantswarm_client_wrapper';
import GiantSwarmV4 from 'giantswarm-v4';

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
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;
    var usersApi = new GiantSwarmV4.UsersApi();


    return usersApi.getCurrentUser()
    .then((data) => {
      var userData = {
        email: data.email,
        auth: {
          scheme: scheme,
          token: token
        }
      };

      dispatch({
        type: types.REFRESH_USER_INFO_SUCCESS,
        userData: userData
      });
    })
    .then(getInfo().bind(this, dispatch, getState))
    .catch((error) => {
      dispatch({
        type: types.REFRESH_USER_INFO_ERROR,
        error: error
      });
      throw(error);
    });
  };
}

export function auth0Login(authResult) {
  return function(dispatch) {
    return new Promise(function(resolve) {
      var userData = {
        email: authResult.idTokenPayload.email,
        auth: {
          scheme: 'Bearer',
          token: authResult.idToken
        }
      };

      resolve(dispatch(loginSuccess(userData)));
    });
  };
}


export function giantswarmLogin(email, password) {
  return function(dispatch, getState) {
    var giantSwarm = new GiantSwarm.Client();
    var usersApi = new GiantSwarmV4.UsersApi();

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
    .then(() => {
      usersApi.apiClient.authentications.AuthorizationHeaderToken.apiKeyPrefix = 'giantswarm';
      usersApi.apiClient.authentications.AuthorizationHeaderToken.apiKey = giantSwarm.authToken;
      return usersApi.getCurrentUser();
    })
    .then((data) => {
      var userData = {
        email: data.email,
        auth: {
          scheme: 'giantswarm',
          token: giantSwarm.authToken
        }
      };

      return userData;
    })
    .then((userData) => {
      dispatch(loginSuccess(userData));
      return userData;
    })
    .then(getInfo().bind(this, dispatch, getState))
    .catch(error => {
      dispatch(loginError(error));
      console.error(error);
      throw(error);
    });
  };
}

export function giantswarmLogout() {
  return function(dispatch, getState) {
    var authToken;
    if (getState().app.loggedInUser) {
      authToken = getState().app.loggedInUser.auth.token;
    } else  {
      authToken = undefined;
    }

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

export function unauthorized() {
  return function(dispatch) {
    dispatch(flashAdd({
      message: <div>You have been logged out.</div>,
      class: 'danger'
    }));

    dispatch({
      type: types.UNAUTHORIZED
    });

    return null;
  };
}

export function getInfo() {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;
    var scheme = getState().app.loggedInUser.auth.scheme;
    var infoApi = new GiantSwarmV4.InfoApi();
    infoApi.apiClient.authentications.AuthorizationHeaderToken.apiKeyPrefix = scheme;
    infoApi.apiClient.authentications.AuthorizationHeaderToken.apiKey = token;

    dispatch({
      type: types.INFO_LOAD
    });

    return infoApi.getInfo()
    .then((info) => {
      dispatch({
        type: types.INFO_LOAD_SUCCESS,
        info: info
      });
    })
    .catch((error) => {
      dispatch({
        type: types.INFO_LOAD_ERROR,
        error: error
      });
      console.error(error);
      throw(error);
    });
  };
}
