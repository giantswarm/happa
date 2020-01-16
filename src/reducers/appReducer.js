import * as types from 'actions/actionTypes';
import produce from 'immer';
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
      case types.REFRESH_USER_INFO_SUCCESS:
        draft.loggedInUser = action.userData;

        return;

      case types.INFO_LOAD_SUCCESS:
        draft.info = action.info;

        return;

      case types.LOGIN_SUCCESS:
        // TODO This is a Side effect.
        // Is there a better place for setUserToStorage()?
        setUserToStorage(action.userData);
        draft.loggedInUser = action.userData;

        return;

      case types.LOGIN_ERROR:
      case types.LOGOUT_SUCCESS:
      case types.LOGOUT_ERROR:
      case types.UNAUTHORIZED:
        // TODO This is a Side effect.
        // Is there a better place for removeUserFromStorage()?
        removeUserFromStorage();
        draft.loggedInUser = {};
        draft.firstLoadComplete = false;

        return;

      case types.ORGANIZATION_SELECT:
        draft.selectedOrganization = action.orgId;

        return;

      case types.ORGANIZATIONS_LOAD_SUCCESS:
        draft.selectedOrganization = action.selectedOrganization;

        return;

      case types.CLUSTER_SELECT:
        draft.selectedClusterID = action.clusterID;
    }
  }, initialState());
};

export default makeAppReducer;
