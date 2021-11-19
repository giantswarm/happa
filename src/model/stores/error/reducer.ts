import produce from 'immer';
import {
  ERROR_CLEAR_FOR_TYPE,
  ERROR_SUCCESS_SUFFIX,
  ERROR_SUFFIX,
} from 'model/stores/error/constants';
import {
  ErrorActions,
  IErrorAction,
  IErrorClearByTypeAction,
  IErrorState,
} from 'model/stores/error/types';

const errorActionTypeRegexp = new RegExp(
  `(.*)_(${ERROR_SUFFIX}|${ERROR_SUCCESS_SUFFIX})`
);

const initialState: IErrorState = {};

const errorReducer = produce((draft: IErrorState, action: ErrorActions) => {
  if (action.type === ERROR_CLEAR_FOR_TYPE) {
    delete draft[(action as IErrorClearByTypeAction).errorType];

    return;
  }

  const { type, error } = action as IErrorAction;
  const matches = errorActionTypeRegexp.exec(type);
  if (!matches) return;
  const [, requestName, requestState] = matches;

  switch (requestState) {
    case ERROR_SUFFIX:
      draft[requestName] = error;

      return;

    case ERROR_SUCCESS_SUFFIX:
      if (draft[requestName]) {
        delete draft[requestName];
      }
  }
}, initialState);

export default errorReducer;
