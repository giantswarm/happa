import { typeWithoutSuffix } from 'selectors/selectorUtils';
import { ERROR_CLEAR_FOR_TYPE } from 'stores/error/constants';
import { IErrorClearByTypeAction } from 'stores/error/types';

export function clearError(errorType: string): IErrorClearByTypeAction {
  return {
    type: ERROR_CLEAR_FOR_TYPE,
    errorType: typeWithoutSuffix(errorType),
  };
}
