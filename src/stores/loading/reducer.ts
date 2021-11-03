import produce from 'immer';
import { ILoadingState, LoadingActions } from 'stores/loading/types';

const loadingActionTypeRegexp =
  /(.*)_(REQUEST|SUCCESS|ERROR|FINISHED|NOT_FOUND)$/;

const initialState: ILoadingState = {};

const loadingReducer = produce(
  (draft: ILoadingState, action: LoadingActions) => {
    const { type } = action;
    const matches = loadingActionTypeRegexp.exec(type);
    if (!matches) return;
    const [, requestName, requestState] = matches;

    draft[requestName] = requestState === 'REQUEST';
  },
  initialState
);

export default loadingReducer;
