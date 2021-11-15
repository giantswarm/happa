import produce from 'immer';
import {
  ORGANIZATION_CREDENTIALS_LOAD_ERROR,
  ORGANIZATION_CREDENTIALS_LOAD_REQUEST,
  ORGANIZATION_CREDENTIALS_LOAD_SUCCESS,
  ORGANIZATION_CREDENTIALS_SET,
  ORGANIZATION_CREDENTIALS_SET_CONFIRMED_REQUEST,
  ORGANIZATION_CREDENTIALS_SET_DISCARD,
  ORGANIZATION_CREDENTIALS_SET_ERROR,
  ORGANIZATION_CREDENTIALS_SET_SUCCESS,
  ORGANIZATION_DELETE_ERROR,
  ORGANIZATION_DELETE_SUCCESS,
  ORGANIZATION_LOAD_ERROR,
  ORGANIZATION_LOAD_MAPI_REQUEST,
  ORGANIZATION_LOAD_REQUEST,
  ORGANIZATION_LOAD_SUCCESS,
} from 'stores/organization/constants';
import {
  IOrganizationState,
  OrganizationActions,
} from 'stores/organization/types';

const initialState: IOrganizationState = {
  lastUpdated: 0,
  isFetching: false,
  items: {},
  credentials: {
    lastUpdated: 0,
    isFetching: false,
    items: [],
    showForm: false,
  },
};

const organizationReducer = produce(
  (draft: IOrganizationState, action: OrganizationActions) => {
    switch (action.type) {
      case ORGANIZATION_LOAD_MAPI_REQUEST:
      case ORGANIZATION_LOAD_REQUEST:
        draft.isFetching = true;

        break;

      case ORGANIZATION_LOAD_SUCCESS:
        draft.lastUpdated = Date.now();
        draft.isFetching = false;
        draft.items = action.organizations;

        break;

      case ORGANIZATION_LOAD_ERROR:
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
        draft.credentials.showForm = true;

        break;

      case ORGANIZATION_CREDENTIALS_SET_DISCARD:
      case ORGANIZATION_CREDENTIALS_SET_SUCCESS:
        draft.credentials.showForm = false;

        break;

      case ORGANIZATION_CREDENTIALS_LOAD_REQUEST:
        draft.credentials.isFetching = true;

        break;

      case ORGANIZATION_CREDENTIALS_LOAD_SUCCESS:
        draft.credentials.lastUpdated = Date.now();
        draft.credentials.isFetching = false;
        draft.credentials.items = action.credentials;

        break;

      case ORGANIZATION_CREDENTIALS_LOAD_ERROR:
        draft.isFetching = false;

        break;
    }
  },
  initialState
);

export default organizationReducer;
