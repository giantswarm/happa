import * as types from './actionTypes';

export function modalHide() {
  console.log('triggered?');
  return { type: types.MODAL_HIDE };
}
