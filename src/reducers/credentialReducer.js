

import * as types from '../actions/actionTypes';

export default function credentialReducer(
  state = {
    lastUpdated: 0,
    isFetching: false,
    items: [],
  },
  action = undefined
) {
  switch (action.type) {
    case types.ORGANIZATION_CREDENTIALS_LOAD:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: true,
        items: [],
      };

    case types.ORGANIZATION_CREDENTIALS_LOAD_SUCCESS:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: action.credentials,
      };

    case types.ORGANIZATION_CREDENTIALS_LOAD_ERROR:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: state.items,
      };

    default:
      return state;
  }
}
