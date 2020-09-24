import {
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_REQUEST,
  GLOBAL_LOAD_SUCCESS,
} from 'stores/global/constants';

export interface GlobalLoadRequestAction {
  type: typeof GLOBAL_LOAD_REQUEST;
}

export interface GlobalLoadSuccessAction {
  type: typeof GLOBAL_LOAD_SUCCESS;
}

export interface GlobalLoadErrorAction {
  type: typeof GLOBAL_LOAD_ERROR;
}

export type GlobalActions =
  | GlobalLoadRequestAction
  | GlobalLoadSuccessAction
  | GlobalLoadErrorAction;
