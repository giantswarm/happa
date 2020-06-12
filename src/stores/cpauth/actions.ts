import CPAuth from 'lib/CPAuth';
import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import { IState } from 'reducers/types';
import { createAsynchronousAction } from 'stores/asynchronousAction';
import {
  CPAUTH_USER_EXPIRED,
  CPAUTH_USER_EXPIRING,
  CPAUTH_USER_LOAD,
  CPAUTH_USER_LOAD_SUCCESS,
  CPAUTH_USER_SESSION_TERMINATED,
  CPAUTH_USER_SIGNED_OUT,
} from 'stores/cpauth/constants';
import {
  ICPAuthLoadUserActionSuccess,
  ICPAuthUserExpiredAction,
  ICPAuthUserExpiringAction,
  ICPAuthUserSessionTerminatedAction,
  ICPAuthUserSignedOutAction,
} from 'stores/cpauth/types';

export function userExpiring(): ICPAuthUserExpiringAction {
  return {
    type: CPAUTH_USER_EXPIRING,
  };
}

export function userExpired(): ICPAuthUserExpiredAction {
  return {
    type: CPAUTH_USER_EXPIRED,
  };
}

export function userSignedOut(): ICPAuthUserSignedOutAction {
  return {
    type: CPAUTH_USER_SIGNED_OUT,
  };
}

export function userSessionTerminated(): ICPAuthUserSessionTerminatedAction {
  return {
    type: CPAUTH_USER_SESSION_TERMINATED,
  };
}

export function loadUserSuccess(
  user: IOAuth2User | null
): ICPAuthLoadUserActionSuccess {
  return {
    type: CPAUTH_USER_LOAD_SUCCESS,
    response: user,
  };
}

export const loadUser = createAsynchronousAction<
  CPAuth,
  IState,
  IOAuth2User | null
>({
  actionTypePrefix: CPAUTH_USER_LOAD,

  perform: async (_, cpAuth?: CPAuth): Promise<IOAuth2User | null> => {
    const user = await (cpAuth as CPAuth).getLoggedInUser();
    if (!user) return null;

    return user.serialize();
  },
  shouldPerform: () => true,
});
