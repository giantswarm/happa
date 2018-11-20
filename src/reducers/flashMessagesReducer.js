'use strict';

import Immutable from 'immutable';
import * as types from '../actions/actionTypes';

var id = 0;
function flashId() {
  return id++;
}

export default function modalReducer(
  state = Immutable.Set(),
  action = undefined
) {
  switch (action.type) {
    case types.FLASH_REMOVE:
      return state.remove(action.flashMessage);

    case types.FLASH_ADD:
      if (!action.flashMessage.key) {
        action.flashMessage.key = flashId();
      }

      return state.add(action.flashMessage);

    case types.FLASH_CLEAR_ALL:
      return Immutable.Set();

    default:
      return state;
  }
}
