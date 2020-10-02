import { IState } from 'reducers/types';
import { typeWithoutSuffix } from 'selectors/selectorUtils';

export function selectLoadingFlagByIdAndAction(
  state: IState,
  id: string,
  actionType: string
) {
  return (
    state.loadingFlagsByEntity[id]?.[typeWithoutSuffix(actionType)] ?? true
  );
}
