import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = { lastUpdated: 0, isFetching: false, items: {} };

/**
 * organizationReducer manipulates the appplication state based on organization actions.
 *
 * 'items' here ends up in the state's entities.organizations attribute.
 *
 * @param {*} state
 * @param {*} action
 */
const organizationReducer = produce((draft, action) => {
  switch (action.type) {
    case types.ORGANIZATIONS_LOAD:
      draft.isFetching = true;
      return;

    case types.ORGANIZATIONS_LOAD_SUCCESS:
      draft.lastUpdated = Date.now();
      draft.isFetching = false;
      draft.items = action.organizations;
      return;

    case types.ORGANIZATIONS_LOAD_ERROR:
      draft.isFetching = false;
      return;

    case types.ORGANIZATION_DELETE_SUCCESS:
      delete draft.items[action.orgId];
      return;

    case types.ORGANIZATION_DELETE_ERROR:
      draft.isFetching = false;
      return;

    case types.ORGANIZATION_CREDENTIALS_SET:
    case types.ORGANIZATION_CREDENTIALS_SET_CONFIRMED:
    case types.ORGANIZATION_CREDENTIALS_SET_ERROR:
      draft.showCredentialsForm = true;
      return;

    case types.ORGANIZATION_CREDENTIALS_SET_SUCCESS:
      draft.showCredentialsForm = false;
      return;
  }
}, initialState);

export default organizationReducer;
