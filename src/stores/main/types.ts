import {
  CLUSTER_SELECT,
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_REQUEST,
  GLOBAL_LOAD_SUCCESS,
  LOGIN_ERROR,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_ERROR,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  REFRESH_USER_INFO_ERROR,
  REFRESH_USER_INFO_REQUEST,
  REFRESH_USER_INFO_SUCCESS,
  REQUEST_PASSWORD_RECOVERY_TOKEN_REQUEST,
  SET_NEW_PASSWORD,
  VERIFY_PASSWORD_RECOVERY_TOKEN,
} from 'stores/main/constants';

export enum LoggedInUserTypes {
  GS,
  MAPI,
}

export interface IMainState {
  loggedInUser: ILoggedInUser | null;
  selectedOrganization: string | null;
  firstLoadComplete: boolean;
  selectedClusterID: string | null;
}

export interface IMainSelectClusterAction {
  type: typeof CLUSTER_SELECT;
  clusterID: string;
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
  loggedInUser: ILoggedInUser;
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

export type MainActions =
  | IMainSelectClusterAction
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
  | IMainSetNewPasswordAction;
