"use strict";

import * as types from '../actions/actionTypes';

export default function modalReducer(state, action = undefined) {
  switch(action.type) {
    case types.MODAL_HIDE:
      return {
        visible: false
      };

    case types.ORGANIZATION_DELETE:
      return {
        visible: true,
        templateValues: {},
        template: ''
      };

    default:
      return {
        visible: false,
        templateValues: {},
        template: ''
      };
  }
}