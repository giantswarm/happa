import produce from 'immer';

import { loadReleases } from './actions';
import { IReleaseActionResponse } from './types';

interface IState {
  error?: Error;
  isFetching: boolean;
  items: IReleases;
  sortedVersions: string[];
}

const initialState: IState = {
  error: undefined,
  isFetching: false,
  items: {},
  sortedVersions: [],
};

const releasesReducer = produce(
  (
    draft: IState,
    action: { type: string; response: IReleaseActionResponse; error?: Error }
  ) => {
    const { types } = loadReleases();
    switch (action.type) {
      case types.request:
        draft.isFetching = true;
        draft.error = undefined;

        break;

      case types.success:
        draft.isFetching = false;
        draft.error = undefined;
        draft.items = action.response.releases;
        draft.sortedVersions = action.response.sortedReleaseVersions;

        break;

      case types.error:
        draft.isFetching = false;
        draft.error = action.error;
    }
  },
  initialState
);

export default releasesReducer;
