"use strict";

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


export function login(email, password) {
  var giantSwarm = new GiantSwarm.Client();

  return function(dispatch, getState) {
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
        throw("Invalid email and/or password");
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
    return dispatch({
      type: types.LOGOUT
    });
  };
}