import { typeWithoutSuffix } from 'selectors/selectorUtils';
import { IState } from 'stores/state';

export function selectLoadingFlagByAction(state: IState, actionType: string) {
  return state.loadingFlags[typeWithoutSuffix(actionType)] ?? null;
}
