import { typeWithoutSuffix } from 'selectors/selectorUtils';
import { IState } from 'stores/state';

export function selectLoadingFlagByIdAndAction(
  state: IState,
  id: string,
  actionType: string
) {
  return (
    state.loadingFlagsByEntity[id]?.[typeWithoutSuffix(actionType)] ?? true
  );
}
