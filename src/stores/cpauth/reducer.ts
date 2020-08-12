import produce from 'immer';
import {
  CPAUTH_USER_EXPIRED,
  CPAUTH_USER_LOAD_SUCCESS,
  CPAUTH_USER_SESSION_TERMINATED,
  CPAUTH_USER_SIGNED_OUT,
} from 'stores/cpauth/constants';
import { CPAuthActions, ICPAuthState } from 'stores/cpauth/types';

import * as actions from './actions';

const initialState: ICPAuthState = {
  user: null,
  isFetching: false,
};

const cpAuthReducer = produce((draft: ICPAuthState, action: CPAuthActions) => {
  switch (action.type) {
    case actions.loadUser().types.request:
      draft.isFetching = true;

      break;

    case actions.loadUser().types.success as typeof CPAUTH_USER_LOAD_SUCCESS:
      draft.user = action.response;
      draft.isFetching = false;

      break;

    case actions.loadUser().types.error:
      draft.user = null;
      draft.isFetching = false;

      break;

    case CPAUTH_USER_SESSION_TERMINATED:
    case CPAUTH_USER_SIGNED_OUT:
    case CPAUTH_USER_EXPIRED:
      draft.user = null;
      draft.isFetching = false;

      break;
  }
}, initialState);

export default cpAuthReducer;
