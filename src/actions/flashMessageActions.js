'use strict';

import * as types from './actionTypes';

export function flashRemove(flashMessage) {
  return { type: types.FLASH_REMOVE, flashMessage };
}

export function flashAdd(flashMessage) {
  return function(dispatch) {
    dispatch({ type: types.FLASH_ADD, flashMessage });

    if (flashMessage.ttl) {
      setTimeout(() => {
        dispatch({ type: types.FLASH_REMOVE, flashMessage });
      }, flashMessage.ttl);
    }
  };
}

export function flashClearAll() {
  return { type: types.FLASH_CLEAR_ALL };
}
