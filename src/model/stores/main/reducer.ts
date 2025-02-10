import produce from 'immer';
import {
  CLEAR_IMPERSONATION,
  CLUSTER_SELECT,
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_SUCCESS,
  LOGIN_ERROR,
  LOGIN_SUCCESS,
  LOGOUT_ERROR,
  LOGOUT_SUCCESS,
  REFRESH_USER_INFO_ERROR,
  REFRESH_USER_INFO_SUCCESS,
  SET_IMPERSONATION,
} from 'model/stores/main/constants';
import { IMainState, MainActions } from 'model/stores/main/types';
import {
  ORGANIZATION_LOAD_SUCCESS,
  ORGANIZATION_SELECT,
} from 'model/stores/organization/constants';
import { OrganizationActions } from 'model/stores/organization/types';
import {
  fetchSelectedOrganizationFromStorage,
  fetchUserFromStorage,
  removeUserFromStorage,
} from 'utils/localStorageUtils';

const initialState = (): IMainState => ({
  selectedOrganization: fetchSelectedOrganizationFromStorage(),
  selectedClusterID: null,
  firstLoadComplete: false,
  loggedInUser: fetchUserFromStorage(),
  impersonation: null,
});

const makeMainReducer = () => {
  return produce(
    (draft: IMainState, action: MainActions | OrganizationActions) => {
      switch (action.type) {
        case REFRESH_USER_INFO_SUCCESS:
          if ('loggedInUser' in action) {
            draft.loggedInUser = action.loggedInUser;
          }
          break;

        case LOGIN_SUCCESS:
          if ('userData' in action) {
            draft.loggedInUser = action.userData;
          }
          break;

        case REFRESH_USER_INFO_ERROR:
        case LOGIN_ERROR:
        case LOGOUT_SUCCESS:
        case LOGOUT_ERROR:
          removeUserFromStorage();
          draft.loggedInUser = null;
          draft.firstLoadComplete = false;
          break;

        case GLOBAL_LOAD_ERROR:
        case GLOBAL_LOAD_SUCCESS:
          draft.firstLoadComplete = true;
          break;

        case ORGANIZATION_SELECT:
          if ('orgId' in action) {
            draft.selectedOrganization = action.orgId;
          }
          break;

        case ORGANIZATION_LOAD_SUCCESS:
          if ('selectedOrganization' in action) {
            draft.selectedOrganization = action.selectedOrganization;
          }
          break;

        case CLUSTER_SELECT:
          if ('clusterID' in action) {
            draft.selectedClusterID = action.clusterID || null;
          }
          break;

        case SET_IMPERSONATION:
          if ('impersonation' in action) {
            draft.impersonation = action.impersonation;
          }
          break;

        case CLEAR_IMPERSONATION:
          draft.impersonation = null;
          break;
      }
    },
    initialState()
  );
};

export default makeMainReducer;
