import { IState } from 'model/stores/state';
import { typeWithoutSuffix } from 'model/stores/utils';

export function selectLoadingFlagByAction(state: IState, actionType: string) {
  return state.loadingFlags[typeWithoutSuffix(actionType)] ?? null;
}
