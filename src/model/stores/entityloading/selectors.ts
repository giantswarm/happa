import { IState } from 'model/stores/state';
import { typeWithoutSuffix } from 'model/stores/utils';

export function selectLoadingFlagByIdAndAction(
  state: IState,
  id: string,
  actionType: string,
  defaultValue: boolean = true
) {
  return (
    state.loadingFlagsByEntity[id]?.[typeWithoutSuffix(actionType)] ??
    defaultValue
  );
}
