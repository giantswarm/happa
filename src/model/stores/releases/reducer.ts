import produce from 'immer';
import {
  RELEASES_LOAD_ERROR,
  RELEASES_LOAD_REQUEST,
  RELEASES_LOAD_SUCCESS,
} from 'model/stores/releases/constants';

import { loadReleases } from './actions';
import { IReleaseState, ReleaseActions } from './types';

const initialState: IReleaseState = {
  error: null,
  isFetching: false,
  items: {},
};

const releasesReducer = produce(
  (draft: IReleaseState, action: ReleaseActions) => {
    switch (action.type) {
      case loadReleases().types.request as typeof RELEASES_LOAD_REQUEST:
        draft.isFetching = true;
        draft.error = null;

        break;

      case loadReleases().types.success as typeof RELEASES_LOAD_SUCCESS:
        draft.isFetching = false;
        draft.error = null;
        draft.items = action.response.releases;

        break;

      case loadReleases().types.error as typeof RELEASES_LOAD_ERROR:
        draft.isFetching = false;
        draft.error = action.error ?? null;
    }
  },
  initialState
);

export default releasesReducer;
