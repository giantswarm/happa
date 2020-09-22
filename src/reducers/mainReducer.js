import * as types from 'actions/actionTypes';
import produce from 'immer';
import {
  ORGANIZATION_SELECT,
  ORGANIZATIONS_LOAD_SUCCESS,
} from 'stores/organization/constants';
import {
  fetchSelectedOrganizationFromStorage,
  fetchUserFromStorage,
  removeUserFromStorage,
  setUserToStorage,
} from 'utils/localStorageUtils';

const initialState = () => ({
  selectedOrganization: fetchSelectedOrganizationFromStorage(),
  selectedClusterID: undefined,
  firstLoadComplete: false,
  loggedInUser: fetchUserFromStorage(),
  info: {
    general: {
      availability_zones: {
        default: 0,
        max: 0,
      },
      provider: '',
    },
  },
});

const makeAppReducer = () => {
  return produce((draft, action) => {
    switch (action.type) {
      case types.REFRESH_USER_INFO_SUCCESS: {
        const newUser = Object.assign({}, draft.loggedInUser, {
          email: action.email,
        });
        setUserToStorage(newUser);

        draft.loggedInUser = newUser;

        return;
      }

      case types.INFO_LOAD_SUCCESS:
        draft.info = action.info;

        break;

      case types.LOGIN_SUCCESS: {
        setUserToStorage(action.userData);

        draft.loggedInUser = action.userData;

        break;
      }

      case types.REFRESH_USER_INFO_ERROR:
      case types.LOGIN_ERROR:
      case types.LOGOUT_SUCCESS:
      case types.LOGOUT_ERROR:
      case types.UNAUTHORIZED: {
        removeUserFromStorage();

        draft.loggedInUser = {};
        draft.firstLoadComplete = false;

        break;
      }

      case ORGANIZATION_SELECT:
        draft.selectedOrganization = action.orgId;

        break;

      case ORGANIZATIONS_LOAD_SUCCESS:
        draft.selectedOrganization = action.selectedOrganization;

        break;

      case types.CLUSTER_SELECT:
        draft.selectedClusterID = action.clusterID;

        break;
    }
  }, initialState());
};

export default makeAppReducer;
