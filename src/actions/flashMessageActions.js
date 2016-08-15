"use strict";

import * as types from './actionTypes';


export function flashRemove(flashMessage) {
  return {type: types.FLASH_REMOVE, flashMessage};
}

export function flashAdd(flashMessage) {
  return {type: types.FLASH_ADD, flashMessage};
}

export function flashClearAll() {
  return {type: types.FLASH_CLEAR_ALL};
}