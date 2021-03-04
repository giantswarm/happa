import { IOAuth2User } from 'lib/OAuth2/OAuth2User';
import {
  CLUSTER_SELECT,
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_REQUEST,
  GLOBAL_LOAD_SUCCESS,
  INFO_LOAD_ERROR,
  INFO_LOAD_REQUEST,
  INFO_LOAD_SUCCESS,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_ERROR,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  MAPI_AUTH_USER_EXPIRED,
  MAPI_AUTH_USER_EXPIRING,
  MAPI_AUTH_USER_LOAD_ERROR,
  MAPI_AUTH_USER_LOAD_SUCCESS,
  MAPI_AUTH_USER_SESSION_TERMINATED,
  MAPI_AUTH_USER_SIGNED_OUT,
  REFRESH_USER_INFO_ERROR,
  REFRESH_USER_INFO_REQUEST,
  REFRESH_USER_INFO_SUCCESS,
  REQUEST_PASSWORD_RECOVERY_TOKEN_REQUEST,
  SET_NEW_PASSWORD,
  VERIFY_PASSWORD_RECOVERY_TOKEN,
} from 'stores/main/constants';

export interface IMainState {
  loggedInUser: ILoggedInUser | null;
  mapiUser: IOAuth2User | null;
  info: IInstallationInfo;
  selectedOrganization: string | null;
  firstLoadComplete: boolean;
  selectedClusterID: string | null;
}

export interface IMainSelectClusterAction {
  type: typeof CLUSTER_SELECT;
  clusterID: string;
}

export interface IMainInfoLoadRequestAction {
  type: typeof INFO_LOAD_REQUEST;
}

export interface IMainInfoLoadSuccessAction {
  type: typeof INFO_LOAD_SUCCESS;
  info: IInstallationInfo;
}

export interface IMainInfoLoadErrorAction {
  type: typeof INFO_LOAD_ERROR;
  error: string;
}

export interface IGlobalLoadRequestAction {
  type: typeof GLOBAL_LOAD_REQUEST;
}

export interface IGlobalLoadSuccessAction {
  type: typeof GLOBAL_LOAD_SUCCESS;
}

export interface IGlobalLoadErrorAction {
  type: typeof GLOBAL_LOAD_ERROR;
}

export interface IMainLoginRequestAction {
  type: typeof LOGIN_REQUEST;
  email: string;
}

export interface IMainLoginSuccessAction {
  type: typeof LOGIN_SUCCESS;
  userData: ILoggedInUser;
}

export interface IMainLoginErrorAction {
  type: typeof LOGIN_ERROR;
  errorMessage: string;
}

export interface IMainLogoutRequestAction {
  type: typeof LOGOUT_REQUEST;
}

export interface IMainLogoutSuccessAction {
  type: typeof LOGOUT_SUCCESS;
}

export interface IMainLogoutErrorAction {
  type: typeof LOGOUT_ERROR;
  errorMessage: string;
}

export interface IMainRefreshUserInfoRequestAction {
  type: typeof REFRESH_USER_INFO_REQUEST;
}

export interface IMainRefreshUserInfoErrorAction {
  type: typeof REFRESH_USER_INFO_ERROR;
  error: string;
}

export interface IMainRefreshUserInfoSuccessAction {
  type: typeof REFRESH_USER_INFO_SUCCESS;
  email: string;
}

export interface IMainRequestPasswordRecoveryTokenAction {
  type: typeof REQUEST_PASSWORD_RECOVERY_TOKEN_REQUEST;
}

export interface IMainVerifyPasswordRecoveryTokenAction {
  type: typeof VERIFY_PASSWORD_RECOVERY_TOKEN;
}

export interface IMainSetNewPasswordAction {
  type: typeof SET_NEW_PASSWORD;
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

export type MainActions =
  | IMainSelectClusterAction
  | IMainInfoLoadRequestAction
  | IMainInfoLoadSuccessAction
  | IMainInfoLoadErrorAction
  | IGlobalLoadRequestAction
  | IGlobalLoadSuccessAction
  | IGlobalLoadErrorAction
  | IMainLoginRequestAction
  | IMainLoginSuccessAction
  | IMainLoginErrorAction
  | IMainLogoutRequestAction
  | IMainLogoutSuccessAction
  | IMainLogoutErrorAction
  | IMainRefreshUserInfoRequestAction
  | IMainRefreshUserInfoErrorAction
  | IMainRefreshUserInfoSuccessAction
  | IMainRequestPasswordRecoveryTokenAction
  | IMainVerifyPasswordRecoveryTokenAction
  | IMainSetNewPasswordAction
  | IMapiAuthUserExpiringAction
  | IMapiAuthUserExpiredAction
  | IMapiAuthUserSignedOutAction
  | IMapiAuthUserSessionTerminatedAction
  | IMapiAuthLoadUserActionSuccess
  | IMapiAuthLoadUserActionError;
