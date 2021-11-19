import {
  CLUSTER_NODEPOOLS_LOAD_ERROR,
  CLUSTER_NODEPOOLS_LOAD_REQUEST,
  CLUSTER_NODEPOOLS_LOAD_SUCCESS,
  NODEPOOL_CREATE_ERROR,
  NODEPOOL_CREATE_REQUEST,
  NODEPOOL_CREATE_SUCCESS,
  NODEPOOL_DELETE,
  NODEPOOL_DELETE_CONFIRMED_REQUEST,
  NODEPOOL_DELETE_ERROR,
  NODEPOOL_DELETE_SUCCESS,
  NODEPOOL_MULTIPLE_CREATE_FINISHED,
  NODEPOOL_MULTIPLE_CREATE_REQUEST,
  NODEPOOL_MULTIPLE_LOAD_FINISHED,
  NODEPOOL_MULTIPLE_LOAD_REQUEST,
  NODEPOOL_PATCH,
  NODEPOOL_PATCH_ERROR,
} from 'model/stores/nodepool/constants';
import { INodePool, INodePoolScaling } from 'shared/types';

export interface INodePoolState {
  items: Record<string, INodePool>;
  isFetching: boolean;
}

export interface INodePoolForClusterLoadRequestAction {
  type: typeof CLUSTER_NODEPOOLS_LOAD_REQUEST;
  id: string;
}

export interface INodePoolForClusterLoadSuccessAction {
  type: typeof CLUSTER_NODEPOOLS_LOAD_SUCCESS;
  id: string;
  nodePools: INodePool[];
  nodePoolIDs: string[];
}

export interface INodePoolForClusterLoadErrorAction {
  type: typeof CLUSTER_NODEPOOLS_LOAD_ERROR;
  id: string;
  error: string;
}

export interface INodePoolPatchActionPayload {
  name?: string;
  scaling?: INodePoolScaling;
}

export interface INodePoolPatchAction {
  type: typeof NODEPOOL_PATCH;
  nodePool: INodePool;
  payload: INodePoolPatchActionPayload;
}

export interface INodePoolPatchErrorAction {
  type: typeof NODEPOOL_PATCH_ERROR;
  error: string;
  nodePool: INodePool;
}

export interface INodePoolDeleteAction {
  type: typeof NODEPOOL_DELETE;
  clusterID: string;
  nodePool: INodePool;
}

export interface INodePoolDeleteSuccessAction {
  type: typeof NODEPOOL_DELETE_SUCCESS;
  clusterID: string;
  nodePool: INodePool;
}

export interface INodePoolDeleteErrorAction {
  type: typeof NODEPOOL_DELETE_ERROR;
  error: string;
  nodePoolID: string;
}

export interface INodePoolDeleteConfirmedAction {
  type: typeof NODEPOOL_DELETE_CONFIRMED_REQUEST;
  clusterID: string;
  nodePool: INodePool;
}

export interface INodePoolLoadRequestAction {
  type: typeof NODEPOOL_MULTIPLE_LOAD_REQUEST;
}

export interface INodePoolLoadFinishedAction {
  type: typeof NODEPOOL_MULTIPLE_LOAD_FINISHED;
}

export interface INodePoolCreateMultipleRequestAction {
  type: typeof NODEPOOL_MULTIPLE_CREATE_REQUEST;
}

export interface INodePoolCreateMultipleFinishedAction {
  type: typeof NODEPOOL_MULTIPLE_CREATE_FINISHED;
}

export interface INodePoolCreateRequestAction {
  type: typeof NODEPOOL_CREATE_REQUEST;
}

export interface INodePoolCreateSuccessAction {
  type: typeof NODEPOOL_CREATE_SUCCESS;
  clusterID: string;
  nodePool: INodePool;
}

export interface INodePoolCreateErrorAction {
  type: typeof NODEPOOL_CREATE_ERROR;
  error: string;
  clusterID: string;
  nodePool: INodePool;
}

export type NodePoolActions =
  | INodePoolForClusterLoadRequestAction
  | INodePoolForClusterLoadSuccessAction
  | INodePoolForClusterLoadErrorAction
  | INodePoolPatchAction
  | INodePoolPatchErrorAction
  | INodePoolDeleteAction
  | INodePoolDeleteSuccessAction
  | INodePoolDeleteErrorAction
  | INodePoolDeleteConfirmedAction
  | INodePoolLoadRequestAction
  | INodePoolLoadFinishedAction
  | INodePoolCreateMultipleRequestAction
  | INodePoolCreateMultipleFinishedAction
  | INodePoolCreateRequestAction
  | INodePoolCreateSuccessAction
  | INodePoolCreateErrorAction;
