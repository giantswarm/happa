import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import {
  CPAUTH_USER_EXPIRED,
  CPAUTH_USER_EXPIRING,
  CPAUTH_USER_LOAD_SUCCESS,
  CPAUTH_USER_SESSION_TERMINATED,
  CPAUTH_USER_SIGNED_OUT,
} from 'stores/cpauth/constants';

export interface ICPAuthState {
  user: IOAuth2User | null;
  isFetching: boolean;
}

export interface ICPAuthUserExpiringAction {
  type: typeof CPAUTH_USER_EXPIRING;
}

export interface ICPAuthUserExpiredAction {
  type: typeof CPAUTH_USER_EXPIRED;
}

export interface ICPAuthUserSignedOutAction {
  type: typeof CPAUTH_USER_SIGNED_OUT;
}

export interface ICPAuthUserSessionTerminatedAction {
  type: typeof CPAUTH_USER_SESSION_TERMINATED;
}

export interface ICPAuthLoadUserActionSuccess {
  type: typeof CPAUTH_USER_LOAD_SUCCESS;
  response: IOAuth2User | null;
}

export type CPAuthActions =
  | ICPAuthUserExpiringAction
  | ICPAuthUserExpiredAction
  | ICPAuthUserSignedOutAction
  | ICPAuthUserSessionTerminatedAction
  | ICPAuthLoadUserActionSuccess;
