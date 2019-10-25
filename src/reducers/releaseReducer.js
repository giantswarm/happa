import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = {
  items: {},
  releaseSelected: '',
  activeSortedReleases: [],
};

const releaseReducer = produce((draft, action) => {
  switch (action.type) {
    case types.RELEASES_LOAD_SUCCESS:
      draft.items = action.releases;
      draft.activeSortedReleases = action.activeSortedReleases;
      return;

    case types.RELEASES_LOAD_ERROR:
      draft.errorLoading = true;
      return;

    case types.RELEASE_SELECTED:
      draft.releaseSelected = action.release;
      return;
  }
}, initialState);

export default releaseReducer;
