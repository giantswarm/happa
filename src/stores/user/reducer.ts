import produce from 'immer';
import {
  USERS_DELETE_SUCCESS,
  USERS_LOAD_ERROR,
  USERS_LOAD_REQUEST,
  USERS_LOAD_SUCCESS,
  USERS_REMOVE_EXPIRATION_SUCCESS,
} from 'stores/user/constants';
import { IUserState, UserActions } from 'stores/user/types';

const initialState: IUserState = {
  lastUpdated: 0,
  isFetching: false,
  items: {},
};

const userReducer = produce((draft: IUserState, action: UserActions) => {
  switch (action.type) {
    case USERS_LOAD_REQUEST:
      draft.isFetching = true;

      break;

    case USERS_LOAD_SUCCESS:
      // TODO move dates into action creators
      draft.lastUpdated = Date.now();
      draft.isFetching = false;
      draft.items = action.users;

      break;

    case USERS_LOAD_ERROR:
      draft.isFetching = false;

      break;

    case USERS_REMOVE_EXPIRATION_SUCCESS:
      draft.items[action.user.email] = action.user;

      break;

    case USERS_DELETE_SUCCESS:
      delete draft.items[action.email];

      break;
  }
}, initialState);

export default userReducer;
