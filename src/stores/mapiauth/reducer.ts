import produce from 'immer';
import {
  MAPI_AUTH_USER_EXPIRED,
  MAPI_AUTH_USER_LOAD_SUCCESS,
  MAPI_AUTH_USER_SESSION_TERMINATED,
  MAPI_AUTH_USER_SIGNED_OUT,
} from 'stores/mapiauth/constants';
import { IMapiAuthState, MapiAuthActions } from 'stores/mapiauth/types';

import * as actions from './actions';

const initialState: IMapiAuthState = {
  user: null,
  isFetching: false,
};

const mapiAuthReducer = produce(
  (draft: IMapiAuthState, action: MapiAuthActions) => {
    switch (action.type) {
      case actions.loadUser().types.request:
        draft.isFetching = true;

        break;

      case actions.loadUser().types
        .success as typeof MAPI_AUTH_USER_LOAD_SUCCESS:
        draft.user = action.response;
        draft.isFetching = false;

        break;

      case actions.loadUser().types.error:
        draft.user = null;
        draft.isFetching = false;

        break;

      case MAPI_AUTH_USER_SESSION_TERMINATED:
      case MAPI_AUTH_USER_SIGNED_OUT:
      case MAPI_AUTH_USER_EXPIRED:
        draft.user = null;
        draft.isFetching = false;

        break;
    }
  },
  initialState
);

export default mapiAuthReducer;
