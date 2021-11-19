import produce from 'immer';
import {
  UPDATE_CLUSTER_LABELS_ERROR,
  UPDATE_CLUSTER_LABELS_REQUEST,
  UPDATE_CLUSTER_LABELS_SUCCESS,
} from 'model/stores/clusterlabels/constants';
import {
  ClusterLabelsActions,
  IClusterLabelsState,
} from 'model/stores/clusterlabels/types';

import { updateClusterLabels } from './actions';

const initialState: IClusterLabelsState = {
  requestInProgress: false,
  error: null,
};

const clusterLabelsReducer = produce(
  (draft: IClusterLabelsState, action: ClusterLabelsActions) => {
    switch (action.type) {
      case updateClusterLabels().types
        .request as typeof UPDATE_CLUSTER_LABELS_REQUEST:
        draft.requestInProgress = true;
        draft.error = null;

        break;

      case updateClusterLabels().types
        .success as typeof UPDATE_CLUSTER_LABELS_SUCCESS:
        draft.requestInProgress = false;
        draft.error = null;

        break;

      case updateClusterLabels().types
        .error as typeof UPDATE_CLUSTER_LABELS_ERROR:
        draft.requestInProgress = false;
        draft.error = action.error;

        break;
    }
  },
  initialState
);

export default clusterLabelsReducer;
