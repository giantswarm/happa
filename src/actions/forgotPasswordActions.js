'use strict';

import * as types from './actionTypes';
import Passage from '../lib/passage_client';

var passage = new Passage({
  endpoint: window.config.passageEndpoint
});

export function requestPasswordRecoveryToken(email) {
  return function(dispatch) {
    dispatch({
      type: types.REQUEST_PASSWORD_RECOVERY_TOKEN
    });

    return passage.requestPasswordRecoveryToken({email});
  };
}

export function verifyPasswordRecoveryToken(email, token) {
  return function(dispatch) {
    dispatch({
      type: types.VERIFY_PASSWORD_RECOVERY_TOKEN
    });

    return passage.verifyPasswordRecoveryToken({email, token});
  };
}

export function setNewPassword(email, token, password) {
  return function(dispatch) {
    dispatch({
      type: types.SET_NEW_PASSWORD
    });

    return passage.setNewPassword({email, token, password});
  };
}