"use strict";

import * as types from '../actions/actionTypes';

export default function appReducer(state = {selectedOrganization: 'not-yet-loaded'}, action = undefined) {
  switch(action.type) {
    case types.ORGANIZATION_SELECT:
      localStorage.setItem('app.selectedOrganization', action.orgId);
      return {selectedOrganization: action.orgId};

    default:
      return state;
  }
}