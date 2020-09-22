import { INodePool, INodePoolScaling } from 'shared/types';
import {
  CLUSTER_NODEPOOLS_LOAD_SUCCESS,
  NODEPOOL_CREATE_ERROR,
  NODEPOOL_CREATE_SUCCESS,
  NODEPOOL_DELETE_SUCCESS,
  NODEPOOL_PATCH,
  NODEPOOL_PATCH_ERROR,
} from 'stores/nodepool/constants';

export interface INodePoolState {
  items: Record<string, INodePool>;
  isFetching: boolean;
}

export interface INodePoolForClusterLoadSuccessAction {
  type: typeof CLUSTER_NODEPOOLS_LOAD_SUCCESS;
  nodePools: INodePool[];
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

export interface INodePoolDeleteSuccessAction {
  type: typeof NODEPOOL_DELETE_SUCCESS;
  clusterId: string;
  nodePool: INodePool;
}

export interface INodePoolCreateSuccessAction {
  type: typeof NODEPOOL_CREATE_SUCCESS;
  clusterId: string;
  nodePool: INodePool;
}

export interface INodePoolCreateErrorAction {
  type: typeof NODEPOOL_CREATE_ERROR;
  error: string;
  clusterId: string;
  nodePool: INodePool;
}

export type NodePoolActions =
  | INodePoolForClusterLoadSuccessAction
  | INodePoolPatchAction
  | INodePoolPatchErrorAction
  | INodePoolDeleteSuccessAction
  | INodePoolCreateSuccessAction
  | INodePoolCreateErrorAction;
