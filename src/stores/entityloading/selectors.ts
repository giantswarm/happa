import { IState } from 'stores/state';
import { typeWithoutSuffix } from 'stores/utils';

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
