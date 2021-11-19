import { IState } from 'model/stores/state';
import { typeWithoutSuffix } from 'model/stores/utils';

export function selectErrorByAction(
  state: IState,
  actionType: string
): string | null {
  return state.errors[typeWithoutSuffix(actionType)] ?? null;
}
