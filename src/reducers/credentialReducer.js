import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = {
  lastUpdated: 0,
  isFetching: false,
  items: [],
};

const credentialReducer = produce((draft, action) => {
  switch (action.type) {
    case types.ORGANIZATION_CREDENTIALS_LOAD:
      draft.isFetching = true;
      
return;

    case types.ORGANIZATION_CREDENTIALS_LOAD_SUCCESS:
      draft.lastUpdated = Date.now();
      draft.isFetching = false;
      draft.items = action.credentials;
      
return;

    case types.ORGANIZATION_CREDENTIALS_LOAD_ERROR:
      draft.isFetching = false;
      
  }
}, initialState);

export default credentialReducer;
