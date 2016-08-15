"use strict";

import Immutable from 'immutable';
import * as types from '../actions/actionTypes';

export default function modalReducer(state = Immutable.Set(), action = undefined) {
  switch(action.type) {
    case types.FLASH_REMOVE:
      return state.remove(action.flashMessage);


    case types.FLASH_ADD:
      return state.add(action.flashMessage);

    case types.FLASH_CLEAR_ALL:
      return Immutable.Set();

    default:
      return state;
  }
}