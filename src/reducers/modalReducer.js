"use strict";

import * as types from '../actions/actionTypes';

export default function modalReducer(state = {visible: false}, action = undefined) {
  switch(action.type) {
    case types.MODAL_HIDE:
      return Object.assign({}, state, {
        visible: false
      });


    case types.ORGANIZATION_DELETE:
      return {
        visible: true,
        templateValues: {orgId: action.orgId},
        template: 'organizationDelete',
        confirmAction: action.confirmAction
      };

    default:
      return state;
  }
}