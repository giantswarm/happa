import produce from 'immer';
import { Providers } from 'shared/constants';
import {
  CLUSTER_SELECT,
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_SUCCESS,
  INFO_LOAD_SUCCESS,
  LOGIN_ERROR,
  LOGIN_SUCCESS,
  LOGOUT_ERROR,
  LOGOUT_SUCCESS,
  REFRESH_USER_INFO_ERROR,
  REFRESH_USER_INFO_SUCCESS,
  SET_PERMISSIONS,
} from 'stores/main/constants';
import { IMainState, MainActions } from 'stores/main/types';
import {
  ORGANIZATION_LOAD_SUCCESS,
  ORGANIZATION_SELECT,
} from 'stores/organization/constants';
import { OrganizationActions } from 'stores/organization/types';
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
  permissions: {},
  info: {
    general: {
      installation_name: '',
      availability_zones: null,
      provider: Providers.AWS,
    },
    stats: {
      cluster_creation_duration: {
        median: 0,
        p25: 0,
        p75: 0,
      },
    },
    workers: {
      count_per_cluster: {
        max: null,
        default: 0,
      },
    },
  },
});

const makeMainReducer = () => {
  return produce(
    (draft: IMainState, action: MainActions | OrganizationActions) => {
      switch (action.type) {
        case REFRESH_USER_INFO_SUCCESS: {
          draft.loggedInUser = action.loggedInUser;

          break;
        }

        case INFO_LOAD_SUCCESS:
          draft.info = action.info;

          break;

        case LOGIN_SUCCESS: {
          draft.loggedInUser = action.userData;

          break;
        }

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
          draft.selectedOrganization = action.orgId;

          break;

        case ORGANIZATION_LOAD_SUCCESS:
          draft.selectedOrganization = action.selectedOrganization;

          break;

        case CLUSTER_SELECT:
          draft.selectedClusterID = action.clusterID;

          break;

        case SET_PERMISSIONS:
          draft.permissions = action.permissions;

          break;
      }
    },
    initialState()
  );
};

export default makeMainReducer;
