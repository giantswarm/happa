import { IState } from 'stores/state';
import { typeWithoutSuffix } from 'stores/utils';

export function selectErrorByAction(
  state: IState,
  actionType: string
): string | null {
  return state.errors[typeWithoutSuffix(actionType)] ?? null;
}
