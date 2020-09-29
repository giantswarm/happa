import {
  CLUSTER_SELECT,
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_REQUEST,
  GLOBAL_LOAD_SUCCESS,
} from 'stores/global/constants';

export interface IGlobalLoadRequestAction {
  type: typeof GLOBAL_LOAD_REQUEST;
}

export interface IGlobalLoadSuccessAction {
  type: typeof GLOBAL_LOAD_SUCCESS;
}

export interface IGlobalLoadErrorAction {
  type: typeof GLOBAL_LOAD_ERROR;
}

export interface IGlobalSelectClusterAction {
  type: typeof CLUSTER_SELECT;
  clusterID: string;
}

export type GlobalActions =
  | IGlobalLoadRequestAction
  | IGlobalLoadSuccessAction
  | IGlobalLoadErrorAction
  | IGlobalSelectClusterAction;
