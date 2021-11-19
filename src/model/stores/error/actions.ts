import { ERROR_CLEAR_FOR_TYPE } from 'model/stores/error/constants';
import { IErrorClearByTypeAction } from 'model/stores/error/types';
import { typeWithoutSuffix } from 'model/stores/utils';

export function clearError(errorType: string): IErrorClearByTypeAction {
  return {
    type: ERROR_CLEAR_FOR_TYPE,
    errorType: typeWithoutSuffix(errorType),
  };
}
