import produce from 'immer';

import { loadReleases } from './actions';
import { IReleaseActionResponse, IReleaseState } from './types';

const initialState: IReleaseState = {
  error: null,
  isFetching: false,
  items: {},
};

const releasesReducer = produce(
  (
    draft: IReleaseState,
    action: { type: string; response: IReleaseActionResponse; error?: Error }
  ) => {
    const { types } = loadReleases();
    switch (action.type) {
      case types.request:
        draft.isFetching = true;
        draft.error = null;

        break;

      case types.success:
        draft.isFetching = false;
        draft.error = null;
        draft.items = action.response.releases;

        break;

      case types.error:
        draft.isFetching = false;
        draft.error = action.error ?? null;
    }
  },
  initialState
);

export default releasesReducer;
