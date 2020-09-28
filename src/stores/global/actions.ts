import {
  CLUSTER_SELECT,
  GLOBAL_LOAD_ERROR,
  GLOBAL_LOAD_REQUEST,
  GLOBAL_LOAD_SUCCESS,
} from 'stores/global/constants';
import { GlobalActions } from 'stores/global/types';

export function globalLoadStart(): GlobalActions {
  return { type: GLOBAL_LOAD_REQUEST };
}

export function globalLoadFinish(): GlobalActions {
  return { type: GLOBAL_LOAD_SUCCESS };
}

export function globalLoadError(): GlobalActions {
  return { type: GLOBAL_LOAD_ERROR };
}

export function selectCluster(clusterID: string): GlobalActions {
  return {
    type: CLUSTER_SELECT,
    clusterID,
  };
}
