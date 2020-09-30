import { GenericResponse } from 'model/clients/GenericResponse';
import { GiantSwarmClient } from 'model/clients/GiantSwarmClient';
import { getInstallationInfo } from 'model/services/giantSwarm/info';
import { IState } from 'reducers/types';
import { ThunkAction } from 'redux-thunk';
import { CLUSTER_SELECT } from 'stores/main/constants';
import {
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_REQUEST,
  GLOBAL_LOAD_SUCCESS,
} from 'stores/main/constants';
import { selectAuthToken } from 'stores/main/selectors';
import { MainActions } from 'stores/main/types';
import {
  INFO_LOAD_ERROR,
  INFO_LOAD_REQUEST,
  INFO_LOAD_SUCCESS,
} from 'stores/user/constants';

export function selectCluster(clusterID: string): MainActions {
  return {
    type: CLUSTER_SELECT,
    clusterID,
  };
}

export function getInfo(): ThunkAction<
  Promise<void>,
  IState,
  void,
  MainActions
> {
  return async (dispatch, getState) => {
    dispatch({ type: INFO_LOAD_REQUEST });

    try {
      const [authToken, authScheme] = await selectAuthToken(dispatch)(
        getState()
      );
      const httpClient = new GiantSwarmClient(authToken, authScheme);
      const infoRes = await getInstallationInfo(httpClient);

      dispatch({
        type: INFO_LOAD_SUCCESS,
        info: infoRes.data,
      });

      return Promise.resolve();
    } catch (err) {
      dispatch({
        type: INFO_LOAD_ERROR,
        error: (err as GenericResponse<string>).data,
      });

      return Promise.reject(err);
    }
  };
}

export function globalLoadStart(): MainActions {
  return { type: GLOBAL_LOAD_REQUEST };
}

export function globalLoadFinish(): MainActions {
  return { type: GLOBAL_LOAD_SUCCESS };
}

export function globalLoadError(): MainActions {
  return { type: GLOBAL_LOAD_ERROR };
}
