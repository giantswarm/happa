import { typeWithoutSuffix } from 'selectors/selectorUtils';
import { IState } from 'stores/state';

export function selectErrorByIdAndAction(
  state: IState,
  id: string,
  actionType: string
) {
  return state.errorsByEntity[id]?.[typeWithoutSuffix(actionType)] ?? null;
}
