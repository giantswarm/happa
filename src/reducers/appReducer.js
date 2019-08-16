import * as types from 'actions/actionTypes';
import {
  fetchSelectedOrganizationFromStorage,
  fetchUserFromStorage,
  removeUser,
} from 'utils/localStorageUtils';
import produce from 'immer';

const initialState = {
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
};

const appReducer = produce((draft, action) => {
  switch (action.type) {
    case types.REFRESH_USER_INFO_SUCCESS:
      draft.loggedInUser = action.userData;
      return;

    case types.INFO_LOAD_SUCCESS:
      draft.info = action.info;
      return;

    case types.LOGIN_SUCCESS:
      Object.keys(action.userData).forEach(key => {
        draft.loggedInUser[key] = action.userData[key];
      });
      return;

    case types.LOGIN_ERROR:
    case types.LOGOUT_SUCCESS:
    case types.LOGOUT_ERROR:
    case types.UNAUTHORIZED:
      // TODO Is there a better place for removeUser()?
      removeUser();
      draft.loggedInUser = {};
      draft.firstLoadComplete = false;
      return;

    case types.ORGANIZATION_SELECT:
      draft.selectedOrganization = action.orgId;
      return;

    case types.ORGANIZATIONS_LOAD_SUCCESS:
      draft.selectedOrganization = action.selectedOrganization;
      return;

    case types.CLUSTERS_LOAD_SUCCESS_V4:
      draft.firstLoadComplete = true;
      return;

    case types.CLUSTER_SELECT:
      draft.selectedClusterID = action.clusterID;
      return;
  }
}, initialState);

export default appReducer;
