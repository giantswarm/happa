import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = {
  items: {},
  releaseSelected: '',
  activeSortedReleases: [],
  isFetching: false,
};

const releaseReducer = produce((draft, action) => {
  switch (action.type) {
    case types.RELEASES_LOAD:
      draft.isFetching = true;
      
return;

    case types.RELEASES_LOAD_SUCCESS:
      draft.items = action.releases;
      draft.activeSortedReleases = action.activeSortedReleases;
      draft.isFetching = false;
      
return;

    case types.RELEASES_LOAD_ERROR:
      draft.errorLoading = true;
      draft.isFetching = false;
      
return;

    case types.RELEASE_SELECTED:
      draft.releaseSelected = action.release;
      
  }
}, initialState);

export default releaseReducer;
