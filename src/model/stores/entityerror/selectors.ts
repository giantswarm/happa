import { IState } from 'model/stores/state';
import { typeWithoutSuffix } from 'model/stores/utils';

export function selectErrorByIdAndAction(
  state: IState,
  id: string,
  actionType: string
) {
  return state.errorsByEntity[id]?.[typeWithoutSuffix(actionType)] ?? null;
}

export function selectErrorsByIdsAndAction(ids: string[], actionType: string) {
  return function (state: IState) {
    const errors: { [key: string]: string } = {};

    ids.forEach((id) => {
      errors[id] =
        state.errorsByEntity[id]?.[typeWithoutSuffix(actionType)] ?? null;
    });

    return errors;
  };
}
