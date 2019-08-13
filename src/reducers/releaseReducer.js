import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = { items: {} };

const releaseReducer = produce((draft, action) => {
  switch (action.type) {
    case types.RELEASES_LOAD_SUCCESS:
      return action.releases;
  }
}, initialState);

export default releaseReducer;
