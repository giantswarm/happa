import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import {
  MAPI_AUTH_USER_EXPIRED,
  MAPI_AUTH_USER_EXPIRING,
  MAPI_AUTH_USER_LOAD_ERROR,
  MAPI_AUTH_USER_LOAD_SUCCESS,
  MAPI_AUTH_USER_SESSION_TERMINATED,
  MAPI_AUTH_USER_SIGNED_OUT,
} from 'stores/mapiauth/constants';

export interface IMapiAuthState {
  user: IOAuth2User | null;
  isFetching: boolean;
}

export interface IMapiAuthUserExpiringAction {
  type: typeof MAPI_AUTH_USER_EXPIRING;
}

export interface IMapiAuthUserExpiredAction {
  type: typeof MAPI_AUTH_USER_EXPIRED;
}

export interface IMapiAuthUserSignedOutAction {
  type: typeof MAPI_AUTH_USER_SIGNED_OUT;
}

export interface IMapiAuthUserSessionTerminatedAction {
  type: typeof MAPI_AUTH_USER_SESSION_TERMINATED;
}

export interface IMapiAuthLoadUserActionSuccess {
  type: typeof MAPI_AUTH_USER_LOAD_SUCCESS;
  response: IOAuth2User | null;
}

export interface IMapiAuthLoadUserActionError {
  type: typeof MAPI_AUTH_USER_LOAD_ERROR;
  error: string;
}

export type MapiAuthActions =
  | IMapiAuthUserExpiringAction
  | IMapiAuthUserExpiredAction
  | IMapiAuthUserSignedOutAction
  | IMapiAuthUserSessionTerminatedAction
  | IMapiAuthLoadUserActionSuccess
  | IMapiAuthLoadUserActionError;
