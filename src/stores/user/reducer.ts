import produce from 'immer';
import {
  INVITATIONS_LOAD_ERROR,
  INVITATIONS_LOAD_REQUEST,
  INVITATIONS_LOAD_SUCCESS,
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
  invitations: {
    lastUpdated: 0,
    isFetching: false,
    items: {},
  },
};

const userReducer = produce((draft: IUserState, action: UserActions) => {
  switch (action.type) {
    case USERS_LOAD_REQUEST:
      draft.isFetching = true;

      break;

    case USERS_LOAD_SUCCESS:
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

    case INVITATIONS_LOAD_REQUEST:
      draft.invitations.isFetching = true;

      break;

    case INVITATIONS_LOAD_SUCCESS:
      draft.invitations.lastUpdated = Date.now();
      draft.invitations.isFetching = false;
      draft.invitations.items = action.invites;

      break;

    case INVITATIONS_LOAD_ERROR:
      draft.invitations.isFetching = false;

      break;
  }
}, initialState);

export default userReducer;
