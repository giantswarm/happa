import {
  UPDATE_CLUSTER_LABELS_ERROR,
  UPDATE_CLUSTER_LABELS_REQUEST,
  UPDATE_CLUSTER_LABELS_SUCCESS,
} from 'stores/clusterlabels/constants';

export interface IClusterLabelsState {
  requestInProgress: boolean;
  error: Error | null;
}

export interface ILabelChangeActionPayload extends ILabelChange {
  clusterId: string;
}

export interface ILabelChangeActionResponse {
  clusterId: string;
  labels: IClusterLabelMap;
}

export interface ILabelChangeRequestAction {
  type: typeof UPDATE_CLUSTER_LABELS_REQUEST;
}

export interface ILabelChangeSuccessAction {
  type: typeof UPDATE_CLUSTER_LABELS_SUCCESS;
  response: ILabelChangeActionResponse;
}

export interface ILabelChangeErrorAction {
  type: typeof UPDATE_CLUSTER_LABELS_ERROR;
  error: Error;
}

export type ClusterLabelsActions =
  | ILabelChangeRequestAction
  | ILabelChangeSuccessAction
  | ILabelChangeErrorAction;
