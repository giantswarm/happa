import { IState } from 'stores/state';
import { typeWithoutSuffix } from 'stores/utils';

export function selectLoadingFlagByAction(state: IState, actionType: string) {
  return state.loadingFlags[typeWithoutSuffix(actionType)] ?? null;
}
