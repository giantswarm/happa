import { SINGLE_ERROR_CLEAR } from 'actions/actionTypes';
import { useDispatch, useSelector } from 'react-redux';
import { selectErrorByAction } from 'selectors/clusterSelectors';
import { typeWithoutSuffix } from 'selectors/selectorUtils';

export const useError = (errorType) => {
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
};
