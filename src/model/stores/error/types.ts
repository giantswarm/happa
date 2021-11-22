import { ERROR_CLEAR_FOR_TYPE } from 'model/stores/error/constants';

export interface IErrorState {
  [key: string]: string;
}

export interface IErrorClearByTypeAction {
  type: typeof ERROR_CLEAR_FOR_TYPE;
  errorType: string;
}

export interface IErrorAction {
  type: string;
  error: string;
}

export type ErrorActions = IErrorClearByTypeAction | IErrorAction;
