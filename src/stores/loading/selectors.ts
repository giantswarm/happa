import { IState } from 'reducers/types';
import { typeWithoutSuffix } from 'selectors/selectorUtils';

export function selectLoadingFlagByAction(state: IState, actionType: string) {
  return state.loadingFlags[typeWithoutSuffix(actionType)] ?? null;
}
