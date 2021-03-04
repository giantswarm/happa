import produce from 'immer';
import { Providers } from 'shared/constants';
import {
  CLUSTER_SELECT,
  MAPI_AUTH_USER_EXPIRED,
  MAPI_AUTH_USER_LOAD_SUCCESS,
  MAPI_AUTH_USER_SESSION_TERMINATED,
  MAPI_AUTH_USER_SIGNED_OUT,
} from 'stores/main/constants';
import {
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_SUCCESS,
  INFO_LOAD_SUCCESS,
  LOGIN_ERROR,
  LOGIN_SUCCESS,
  LOGOUT_ERROR,
  LOGOUT_SUCCESS,
  REFRESH_USER_INFO_ERROR,
  REFRESH_USER_INFO_SUCCESS,
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
  setUserToStorage,
} from 'utils/localStorageUtils';

import { loadMapiUser } from './actions';

const initialState = (): IMainState => ({
  selectedOrganization: fetchSelectedOrganizationFromStorage(),
  selectedClusterID: null,
  firstLoadComplete: false,
  loggedInUser: fetchUserFromStorage(),
  mapiUser: null,
  info: {
    general: {
      installation_name: '',
      availability_zones: null,
      provider: Providers.AWS,
    },
    stats: {
      cluster_creation_duration: null,
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
          const newUser = Object.assign({}, draft.loggedInUser, {
            email: action.email,
          });
          setUserToStorage(newUser);

          draft.loggedInUser = newUser;

          break;
        }

        case INFO_LOAD_SUCCESS:
          draft.info = action.info;

          break;

        case LOGIN_SUCCESS: {
          setUserToStorage(action.userData);

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

        case loadMapiUser().types.success as typeof MAPI_AUTH_USER_LOAD_SUCCESS:
          draft.mapiUser = action.response;

          break;

        case loadMapiUser().types.error:
          draft.mapiUser = null;

          break;

        case MAPI_AUTH_USER_SESSION_TERMINATED:
        case MAPI_AUTH_USER_SIGNED_OUT:
        case MAPI_AUTH_USER_EXPIRED:
          draft.mapiUser = null;

          break;
      }
    },
    initialState()
  );
};

export default makeMainReducer;
