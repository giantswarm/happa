import { CLUSTER_SELECT } from 'stores/main/constants';
import {
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_REQUEST,
  GLOBAL_LOAD_SUCCESS,
} from 'stores/main/constants';
import {
  INFO_LOAD_ERROR,
  INFO_LOAD_REQUEST,
  INFO_LOAD_SUCCESS,
} from 'stores/user/constants';

export interface IMainState {
  loggedInUser: ILoggedInUser | null;
  info: IInstallationInfo;
  selectedOrganization: string | null;
  firstLoadComplete: boolean;
  selectedClusterID?: string;
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

export type MainActions =
  | IMainSelectClusterAction
  | IMainInfoLoadRequestAction
  | IMainInfoLoadSuccessAction
  | IMainInfoLoadErrorAction
  | IGlobalLoadRequestAction
  | IGlobalLoadSuccessAction
  | IGlobalLoadErrorAction;
