import produce from 'immer';
import {
  ORGANIZATION_CREDENTIALS_LOAD_ERROR,
  ORGANIZATION_CREDENTIALS_LOAD_REQUEST,
  ORGANIZATION_CREDENTIALS_LOAD_SUCCESS,
} from 'stores/organization/constants';

const initialState = {
  lastUpdated: 0,
  isFetching: false,
  items: [],
};

const credentialReducer = produce((draft, action) => {
  switch (action.type) {
    case ORGANIZATION_CREDENTIALS_LOAD_REQUEST:
      draft.isFetching = true;

      return;

    case ORGANIZATION_CREDENTIALS_LOAD_SUCCESS:
      draft.lastUpdated = Date.now();
      draft.isFetching = false;
      draft.items = action.credentials;

      return;

    case ORGANIZATION_CREDENTIALS_LOAD_ERROR:
      draft.isFetching = false;
  }
}, initialState);

export default credentialReducer;
