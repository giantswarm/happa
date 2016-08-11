"use strict";

import * as types from '../actions/actionTypes';

export default function organizationReducer(state = [], action = undefined) {
  switch(action.type) {
    case types.LOAD_ORGANIZATIONS_SUCCESS:
      return action.organizations;
    default:
      return state;
  }
}