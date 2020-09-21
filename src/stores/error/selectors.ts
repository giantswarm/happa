import { IState } from 'reducers/types';
import { typeWithoutSuffix } from 'selectors/selectorUtils';

export function selectErrorByAction(
  state: IState,
  actionType: string
): string | null {
  return state.errors[typeWithoutSuffix(actionType)] ?? null;
}
