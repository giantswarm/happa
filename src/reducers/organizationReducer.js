'use strict';

import * as types from '../actions/actionTypes';

export default function organizationReducer(state = {lastUpdated: 0, isFetching: false, items: {}}, action = undefined) {
  switch(action.type) {
    case types.ORGANIZATIONS_LOAD:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: true,
        items: state.items
      };

    case types.ORGANIZATIONS_LOAD_SUCCESS:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: action.organizations
      };

    case types.ORGANIZATIONS_LOAD_ERROR:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: state.items
      };

    case types.ORGANIZATION_DELETE_CONFIRM:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: state.isFetching,
        items: state.items
      };

    case types.ORGANIZATION_DELETE_ERROR:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: state.items
      };

    case types.ORGANIZATION_LOAD_DOMAINS:
      var items = Object.assign({}, state.items);

      items[action.organizationId] = Object.assign({}, items[action.organizationId], {domains: action.domains});

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    default:
      return state;
  }
}
