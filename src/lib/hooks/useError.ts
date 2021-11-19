import { clearError } from 'model/stores/error/actions';
import { selectErrorByAction } from 'model/stores/error/selectors';
import { IState } from 'model/stores/state';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Select an error message by a given type.
 * @param errorType - The internal error type (e.g. `CLUSTERS_LOAD_REQUEST`).
 */
function useError(errorType: string): {
  errorMessage: string;
  clear: () => void;
} {
  const dispatch = useDispatch();
  const errorMessage =
    useSelector<IState, string | null>((state) =>
      selectErrorByAction(state, errorType)
    ) ?? '';

  const clear = () => {
    dispatch(clearError(errorType));
  };

  return { errorMessage, clear };
}

export default useError;
