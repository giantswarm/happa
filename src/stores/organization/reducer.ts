import produce from 'immer';
import { IState } from 'reducers/types';
import {
  ORGANIZATION_CREDENTIALS_SET,
  ORGANIZATION_CREDENTIALS_SET_CONFIRMED_REQUEST,
  ORGANIZATION_CREDENTIALS_SET_DISCARD,
  ORGANIZATION_CREDENTIALS_SET_ERROR,
  ORGANIZATION_CREDENTIALS_SET_SUCCESS,
  ORGANIZATION_DELETE_ERROR,
  ORGANIZATION_DELETE_SUCCESS,
  ORGANIZATIONS_LOAD_ERROR,
  ORGANIZATIONS_LOAD_REQUEST,
  ORGANIZATIONS_LOAD_SUCCESS,
} from 'stores/organization/constants';
import { IOrganizationState } from 'stores/organization/types';

const initialState: IOrganizationState = {
  lastUpdated: 0,
  isFetching: false,
  items: {},
};

const organizationReducer = produce((draft: IState, action) => {
  switch (action.type) {
    case ORGANIZATIONS_LOAD_REQUEST:
      draft.isFetching = true;

      return;

    case ORGANIZATIONS_LOAD_SUCCESS:
      draft.lastUpdated = Date.now();
      draft.isFetching = false;
      draft.items = action.organizations;

      return;

    case ORGANIZATIONS_LOAD_ERROR:
      draft.isFetching = false;

      return;

    case ORGANIZATION_DELETE_SUCCESS:
      delete draft.items[action.orgId];

      return;

    case ORGANIZATION_DELETE_ERROR:
      draft.isFetching = false;

      return;

    case ORGANIZATION_CREDENTIALS_SET:
    case ORGANIZATION_CREDENTIALS_SET_CONFIRMED_REQUEST:
    case ORGANIZATION_CREDENTIALS_SET_ERROR:
      draft.showCredentialsForm = true;

      return;

    case ORGANIZATION_CREDENTIALS_SET_DISCARD:
    case ORGANIZATION_CREDENTIALS_SET_SUCCESS:
      draft.showCredentialsForm = false;
  }
}, initialState);

export default organizationReducer;
