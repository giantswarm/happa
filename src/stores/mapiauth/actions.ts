import { replace } from 'connected-react-router';
import MapiAuth from 'lib/MapiAuth/MapiAuth';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import { ThunkAction } from 'redux-thunk';
import {
  createAsynchronousAction,
  IAsynchronousDispatch,
} from 'stores/asynchronousAction';
import {
  MAPI_AUTH_USER_EXPIRED,
  MAPI_AUTH_USER_EXPIRING,
  MAPI_AUTH_USER_LOAD,
  MAPI_AUTH_USER_LOAD_ERROR,
  MAPI_AUTH_USER_LOAD_SUCCESS,
  MAPI_AUTH_USER_SESSION_TERMINATED,
  MAPI_AUTH_USER_SIGNED_OUT,
} from 'stores/mapiauth/constants';
import { MapiAuthActions } from 'stores/mapiauth/types';
import { IState } from 'stores/state';

export function userExpiring(): MapiAuthActions {
  return {
    type: MAPI_AUTH_USER_EXPIRING,
  };
}

export function userExpired(): MapiAuthActions {
  return {
    type: MAPI_AUTH_USER_EXPIRED,
  };
}

export function userSignedOut(): MapiAuthActions {
  return {
    type: MAPI_AUTH_USER_SIGNED_OUT,
  };
}

export function userSessionTerminated(): MapiAuthActions {
  return {
    type: MAPI_AUTH_USER_SESSION_TERMINATED,
  };
}

export function loadUserSuccess(user: IOAuth2User | null): MapiAuthActions {
  return {
    type: MAPI_AUTH_USER_LOAD_SUCCESS,
    response: user,
  };
}

export function loadUserError(error: string): MapiAuthActions {
  return {
    type: MAPI_AUTH_USER_LOAD_ERROR,
    error,
  };
}

export const loadUser = createAsynchronousAction<
  MapiAuth,
  IState,
  IOAuth2User | null
>({
  actionTypePrefix: MAPI_AUTH_USER_LOAD,

  perform: async (_, _d, mapiAuth?: MapiAuth): Promise<IOAuth2User | null> => {
    if (!mapiAuth) return null;

    const user = await mapiAuth.getLoggedInUser();
    if (!user) return null;

    return user;
  },
  shouldPerform: () => true,
  throwOnError: true,
});

export function handleLogin(
  mapiAuth: MapiAuth
): ThunkAction<Promise<void>, IState, void, MapiAuthActions> {
  return async (dispatch: IAsynchronousDispatch<IState>) => {
    const urlParams = new URLSearchParams(window.location.search);
    const isLoginResponse = urlParams.has('code') && urlParams.has('state');

    if (isLoginResponse) {
      await mapiAuth.handleLoginResponse(window.location.href);
      dispatch(replace(window.location.pathname));
    }

    await dispatch(loadUser(mapiAuth));
  };
}
