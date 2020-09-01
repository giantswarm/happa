import { SINGLE_ERROR_CLEAR } from 'actions/actionTypes';
import { useDispatch, useSelector } from 'react-redux';
import { selectErrorByAction } from 'selectors/clusterSelectors';
import { typeWithoutSuffix } from 'selectors/selectorUtils';

/**
 * Select an error message by a given type.
 * @param errorType - The internal error type (e.g. `CLUSTERS_LOAD_REQUEST`).
 */
function useError(
  errorType: string
): { errorMessage: string; clear: () => void } {
  const dispatch = useDispatch();
  const errorMessage = useSelector((state) =>
    selectErrorByAction(state, errorType)
  );

  const clear = () => {
    dispatch({
      type: SINGLE_ERROR_CLEAR,
      errorType: typeWithoutSuffix(errorType),
    });
  };

  return { errorMessage, clear };
}

export default useError;
