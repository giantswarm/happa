'use strict';

import * as types from '../actions/actionTypes';

export default function userReducer(state = {lastUpdated: 0, isFetching: false, items: {}}, action = undefined) {
  switch(action.type) {
    case types.USERS_LOAD:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: true,
        items: state.items
      };

    case types.USERS_LOAD_SUCCESS:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: action.users
      };

    case types.USERS_LOAD_ERROR:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: state.items
      };

    case types.USERS_DELETE_CONFIRM:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: state.isFetching,
        items: state.items
      };

    case types.USERS_DELETE_ERROR:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: state.items
      };

    case types.USERS_REMOVE_EXPIRATION_SUCCESS:
      var items = Object.assign({}, state.items);

      items[action.user.email] = action.user;

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    default:
      return state;
  }
}
