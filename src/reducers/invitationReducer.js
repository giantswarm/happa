import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = { lastUpdated: 0, isFetching: false, items: {} };

const invitationReducer = produce((draft, action) => {
  switch (action.type) {
    case types.INVITATIONS_LOAD:
      draft.isFetching = true;
      
return;

    case types.INVITATIONS_LOAD_SUCCESS:
      draft.lastUpdated = Date.now();
      draft.isFetching = false;
      draft.items = action.invites;
      
return;

    case types.INVITATIONS_LOAD_ERROR:
      draft.isFetching = false;
      
  }
}, initialState);

export default invitationReducer;
