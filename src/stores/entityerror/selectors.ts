import { IState } from 'stores/state';
import { typeWithoutSuffix } from 'stores/utils';

export function selectErrorByIdAndAction(
  state: IState,
  id: string,
  actionType: string
) {
  return state.errorsByEntity[id]?.[typeWithoutSuffix(actionType)] ?? null;
}
