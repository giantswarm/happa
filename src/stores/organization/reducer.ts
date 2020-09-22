import produce from 'immer';
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
import {
  IOrganizationState,
  OrganizationActions,
} from 'stores/organization/types';

const initialState: IOrganizationState = {
  lastUpdated: 0,
  isFetching: false,
  items: {},
  showCredentialsForm: false,
};

const organizationReducer = produce(
  (draft: IOrganizationState, action: OrganizationActions) => {
    switch (action.type) {
      case ORGANIZATIONS_LOAD_REQUEST:
        draft.isFetching = true;

        break;

      case ORGANIZATIONS_LOAD_SUCCESS:
        draft.lastUpdated = Date.now();
        draft.isFetching = false;
        draft.items = action.organizations;

        break;

      case ORGANIZATIONS_LOAD_ERROR:
        draft.isFetching = false;

        break;

      case ORGANIZATION_DELETE_SUCCESS:
        delete draft.items[action.orgId];

        break;

      case ORGANIZATION_DELETE_ERROR:
        draft.isFetching = false;

        break;

      case ORGANIZATION_CREDENTIALS_SET:
      case ORGANIZATION_CREDENTIALS_SET_CONFIRMED_REQUEST:
      case ORGANIZATION_CREDENTIALS_SET_ERROR:
        draft.showCredentialsForm = true;

        break;

      case ORGANIZATION_CREDENTIALS_SET_DISCARD:
      case ORGANIZATION_CREDENTIALS_SET_SUCCESS:
        draft.showCredentialsForm = false;

        break;
    }
  },
  initialState
);

export default organizationReducer;
