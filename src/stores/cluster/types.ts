import { IKeyPair } from 'shared/types';
import {
  BATCHED_CLUSTER_CREATION_ERROR,
  BATCHED_CLUSTER_CREATION_REQUEST,
  BATCHED_CLUSTER_CREATION_SUCCESS,
  CLUSTER_CREATE_ERROR,
  CLUSTER_CREATE_KEY_PAIR_ERROR,
  CLUSTER_CREATE_KEY_PAIR_REQUEST,
  CLUSTER_CREATE_KEY_PAIR_SUCCESS,
  CLUSTER_CREATE_REQUEST,
  CLUSTER_CREATE_SUCCESS,
  CLUSTER_DELETE_ERROR,
  CLUSTER_DELETE_REQUEST,
  CLUSTER_DELETE_SUCCESS,
  CLUSTER_LOAD_DETAILS_ERROR,
  CLUSTER_LOAD_DETAILS_REQUEST,
  CLUSTER_LOAD_DETAILS_SUCCESS,
  CLUSTER_LOAD_KEY_PAIRS_ERROR,
  CLUSTER_LOAD_KEY_PAIRS_REQUEST,
  CLUSTER_LOAD_KEY_PAIRS_SUCCESS,
  CLUSTER_LOAD_STATUS_ERROR,
  CLUSTER_LOAD_STATUS_NOT_FOUND,
  CLUSTER_LOAD_STATUS_REQUEST,
  CLUSTER_LOAD_STATUS_SUCCESS,
  CLUSTER_PATCH,
  CLUSTER_PATCH_ERROR,
  CLUSTER_REMOVE_FROM_STORE,
  CLUSTERS_DETAILS_FINISHED,
  CLUSTERS_DETAILS_REQUEST,
  CLUSTERS_LIST_ERROR,
  CLUSTERS_LIST_REFRESH_ERROR,
  CLUSTERS_LIST_REFRESH_REQUEST,
  CLUSTERS_LIST_REFRESH_SUCCESS,
  CLUSTERS_LIST_REQUEST,
  CLUSTERS_LIST_SUCCESS,
  V5_CLUSTER_CREATE_SUCCESS,
} from 'stores/cluster/constants';

export interface IClusterState {
  lastUpdated: number;
  isFetching: boolean;
  items: IClusterMap;
  v5Clusters: string[];
  idsAwaitingUpgrade: IIDsAwaitingUpgradeMap;
}

export interface IIDsAwaitingUpgradeMap {
  [key: string]: true;
}

export interface IClusterListRequestAction {
  type: typeof CLUSTERS_LIST_REQUEST;
}

export interface IClusterListSuccessAction {
  type: typeof CLUSTERS_LIST_SUCCESS;
  clusters: IClusterMap;
  v5ClusterIds: string[];
}

export interface IClusterListErrorAction {
  type: typeof CLUSTERS_LIST_ERROR;
  error: string;
}

export interface IClusterListRefreshRequestAction {
  type: typeof CLUSTERS_LIST_REFRESH_REQUEST;
}

export interface IClusterListRefreshSuccessAction {
  type: typeof CLUSTERS_LIST_REFRESH_SUCCESS;
  clusters: IClusterMap;
  v5ClusterIds: string[];
}

export interface IClusterListRefreshErrorAction {
  type: typeof CLUSTERS_LIST_REFRESH_ERROR;
  error: string;
}

export interface IClusterFetchDetailsRequestAction {
  type: typeof CLUSTERS_DETAILS_REQUEST;
}

export interface IClusterFetchDetailsFinishedAction {
  type: typeof CLUSTERS_DETAILS_FINISHED;
}

export interface IClusterLoadClusterDetailsRequestAction {
  type: typeof CLUSTER_LOAD_DETAILS_REQUEST;
  id: string;
}

export interface IClusterLoadClusterDetailsSuccessAction {
  type: typeof CLUSTER_LOAD_DETAILS_SUCCESS;
  cluster: Cluster;
  id: string;
  isV5Cluster: boolean;
}

export interface IClusterLoadClusterDetailsErrorAction {
  type: typeof CLUSTER_LOAD_DETAILS_ERROR;
  id: string;
  error: string;
}

export interface IClusterRemoveFromStoreAction {
  type: typeof CLUSTER_REMOVE_FROM_STORE;
  clusterId: string;
  isV5Cluster: boolean;
}

export interface IClusterLoadStatusRequestAction {
  type: typeof CLUSTER_LOAD_STATUS_REQUEST;
  id: string;
}

export interface IClusterLoadStatusSuccessAction {
  type: typeof CLUSTER_LOAD_STATUS_SUCCESS;
  id: string;
}

export interface IClusterLoadStatusNotFoundAction {
  type: typeof CLUSTER_LOAD_STATUS_NOT_FOUND;
  id: string;
}

export interface IClusterLoadStatusErrorAction {
  type: typeof CLUSTER_LOAD_STATUS_ERROR;
  id: string;
  error: string;
}

export interface IClusterCreateActionResponse {
  clusterId: string;
  owner: string;
}

export interface IClusterCreateRequestAction {
  type: typeof CLUSTER_CREATE_REQUEST;
}

export interface IClusterCreateSuccessAction {
  type: typeof CLUSTER_CREATE_SUCCESS;
  clusterId: string;
}

export interface IClusterCreateV5SuccessAction {
  type: typeof V5_CLUSTER_CREATE_SUCCESS;
  clusterId: string;
}

export interface IClusterCreateErrorAction {
  type: typeof CLUSTER_CREATE_ERROR;
  error: string;
}

export interface IBatchedClusterCreationRequestAction {
  type: typeof BATCHED_CLUSTER_CREATION_REQUEST;
}

export interface IBatchedClusterCreationSuccessAction {
  type: typeof BATCHED_CLUSTER_CREATION_SUCCESS;
}

export interface IBatchedClusterCreationErrorAction {
  type: typeof BATCHED_CLUSTER_CREATION_ERROR;
  error: string;
}

export interface IClusterDeleteRequestAction {
  type: typeof CLUSTER_DELETE_REQUEST;
  id: string;
}

export interface IClusterDeleteSuccessAction {
  type: typeof CLUSTER_DELETE_SUCCESS;
  id: string;
  timestamp: string;
}

export interface IClusterDeleteErrorAction {
  type: typeof CLUSTER_DELETE_ERROR;
  id: string;
  error: string;
}

export interface IClusterPatchAction {
  type: typeof CLUSTER_PATCH;
  cluster: Cluster;
  payload: Partial<Cluster>;
}

export interface IClusterPatchErrorAction {
  type: typeof CLUSTER_PATCH_ERROR;
  cluster: Cluster;
  error: string;
}

export interface IClusterLoadKeyPairsRequestAction {
  type: typeof CLUSTER_LOAD_KEY_PAIRS_REQUEST;
}

export interface IClusterLoadKeyPairsSuccessAction {
  type: typeof CLUSTER_LOAD_KEY_PAIRS_SUCCESS;
  clusterId: string;
  keyPairs: IKeyPair[];
}

export interface IClusterLoadKeyPairsErrorAction {
  type: typeof CLUSTER_LOAD_KEY_PAIRS_ERROR;
  clusterId: string;
}

export interface IClusterCreateKeyPairRequestAction {
  type: typeof CLUSTER_CREATE_KEY_PAIR_REQUEST;
  keypair: IKeyPair;
}

export interface IClusterCreateKeyPairSuccessAction {
  type: typeof CLUSTER_CREATE_KEY_PAIR_SUCCESS;
  keypair: IKeyPair;
}

export interface IClusterCreateKeyPairErrorAction {
  type: typeof CLUSTER_CREATE_KEY_PAIR_ERROR;
  error: string;
}

export type ClusterActions =
  | IClusterListRequestAction
  | IClusterListSuccessAction
  | IClusterListErrorAction
  | IClusterListRefreshRequestAction
  | IClusterListRefreshSuccessAction
  | IClusterListRefreshErrorAction
  | IClusterFetchDetailsRequestAction
  | IClusterFetchDetailsFinishedAction
  | IClusterLoadClusterDetailsRequestAction
  | IClusterLoadClusterDetailsSuccessAction
  | IClusterLoadClusterDetailsErrorAction
  | IClusterRemoveFromStoreAction
  | IClusterLoadStatusRequestAction
  | IClusterLoadStatusSuccessAction
  | IClusterLoadStatusNotFoundAction
  | IClusterLoadStatusErrorAction
  | IClusterCreateRequestAction
  | IClusterCreateSuccessAction
  | IClusterCreateV5SuccessAction
  | IClusterCreateErrorAction
  | IBatchedClusterCreationRequestAction
  | IBatchedClusterCreationSuccessAction
  | IBatchedClusterCreationErrorAction
  | IClusterDeleteRequestAction
  | IClusterDeleteSuccessAction
  | IClusterDeleteErrorAction
  | IClusterPatchAction
  | IClusterPatchErrorAction
  | IClusterLoadKeyPairsRequestAction
  | IClusterLoadKeyPairsSuccessAction
  | IClusterLoadKeyPairsErrorAction
  | IClusterCreateKeyPairRequestAction
  | IClusterCreateKeyPairSuccessAction
  | IClusterCreateKeyPairErrorAction;
