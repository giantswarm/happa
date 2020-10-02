import { IState } from 'reducers/types';
import { typeWithoutSuffix } from 'selectors/selectorUtils';

export function selectErrorByIdAndAction(
  state: IState,
  id: string,
  actionType: string
) {
  return state.errorsByEntity[id]?.[typeWithoutSuffix(actionType)] ?? null;
}
