"use strict";

import * as types from '../actions/actionTypes';

export default function organizationReducer(state = {lastUpdated: 0, isFetching: false, items: []}, action = undefined) {
  switch(action.type) {
    case types.ORGANIZATIONS_LOAD_SUCCESS:
      console.log(JSON.stringify(action.organizations, null, 2));
      return action.organizations;

    default:
      return state;
  }
}