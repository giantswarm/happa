import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = { lastUpdated: 0, isFetching: false, items: {} };

const userReducer = produce((draft, action) => {
  switch (action.type) {
    case types.USERS_LOAD:
      draft.isFetching = true;
      return;

    case types.USERS_LOAD_SUCCESS:
      // TODO move dates into action creators
      draft.lastUpdated = Date.now();
      draft.isFetching = false;
      draft.items = action.users;
      return;

    case types.USERS_LOAD_ERROR:
      draft.isFetching = false;
      return;

    case types.USERS_REMOVE_EXPIRATION_SUCCESS:
      draft.items[action.user.email] = action.user;
      return;

    case types.USERS_DELETE_SUCCESS:
      delete draft.items[action.email];
      
  }
}, initialState);

export default userReducer;
