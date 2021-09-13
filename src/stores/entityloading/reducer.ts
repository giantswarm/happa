import produce from 'immer';
import {
  EntityLoadingActions,
  IEntityLoadingState,
} from 'stores/entityloading/types';

const loadingActionTypeRegexp =
  /(.*)_(REQUEST|SUCCESS|ERROR|FINISHED|NOT_FOUND)$/;

const initialState: IEntityLoadingState = {};

const entityLoadingReducer = produce(
  (draft: IEntityLoadingState, action: EntityLoadingActions) => {
    const { type, id } = action;
    if (!id) return;

    const matches = loadingActionTypeRegexp.exec(type);
    if (!matches) return;
    const [, requestName, requestState] = matches;

    draft[id] = { ...draft[id], [requestName]: requestState === 'REQUEST' };
  },
  initialState
);

export default entityLoadingReducer;
