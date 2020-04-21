import { typeWithoutSuffix } from 'selectors/selectorUtils';

import * as types from './actionTypes';

/**
 * Clears an error
 *
 * @param {String} errorType The type of the error to clear.
 */
export function clearError(errorType) {
  return {
    type: types.SINGLE_ERROR_CLEAR,
    errorType: typeWithoutSuffix(errorType),
  };
}
