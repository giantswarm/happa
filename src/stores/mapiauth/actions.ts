import MapiAuth from 'lib/MapiAuth/MapiAuth';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import { createAsynchronousAction } from 'stores/asynchronousAction';
import {
  MAPI_AUTH_USER_EXPIRED,
  MAPI_AUTH_USER_EXPIRING,
  MAPI_AUTH_USER_LOAD,
  MAPI_AUTH_USER_LOAD_ERROR,
  MAPI_AUTH_USER_LOAD_SUCCESS,
  MAPI_AUTH_USER_SESSION_TERMINATED,
  MAPI_AUTH_USER_SIGNED_OUT,
} from 'stores/mapiauth/constants';
import {
  IMapiAuthLoadUserActionError,
  IMapiAuthLoadUserActionSuccess,
  IMapiAuthUserExpiredAction,
  IMapiAuthUserExpiringAction,
  IMapiAuthUserSessionTerminatedAction,
  IMapiAuthUserSignedOutAction,
} from 'stores/mapiauth/types';
import { IState } from 'stores/state';

export function userExpiring(): IMapiAuthUserExpiringAction {
  return {
    type: MAPI_AUTH_USER_EXPIRING,
  };
}

export function userExpired(): IMapiAuthUserExpiredAction {
  return {
    type: MAPI_AUTH_USER_EXPIRED,
  };
}

export function userSignedOut(): IMapiAuthUserSignedOutAction {
  return {
    type: MAPI_AUTH_USER_SIGNED_OUT,
  };
}

export function userSessionTerminated(): IMapiAuthUserSessionTerminatedAction {
  return {
    type: MAPI_AUTH_USER_SESSION_TERMINATED,
  };
}

export function loadUserSuccess(
  user: IOAuth2User | null
): IMapiAuthLoadUserActionSuccess {
  return {
    type: MAPI_AUTH_USER_LOAD_SUCCESS,
    response: user,
  };
}

export function loadUserError(error: string): IMapiAuthLoadUserActionError {
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

    return user.serialize();
  },
  shouldPerform: () => true,
  throwOnError: true,
});
