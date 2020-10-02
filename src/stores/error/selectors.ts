import { typeWithoutSuffix } from 'selectors/selectorUtils';
import { IState } from 'stores/state';

export function selectErrorByAction(
  state: IState,
  actionType: string
): string | null {
  return state.errors[typeWithoutSuffix(actionType)] ?? null;
}
