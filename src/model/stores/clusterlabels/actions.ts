import GiantSwarm, { V5ClusterLabelsProperty } from 'giantswarm';
import { filterLabels } from 'model/stores/cluster/utils';
import { UPDATE_CLUSTER_LABELS } from 'model/stores/clusterlabels/constants';
import {
  ILabelChangeActionPayload,
  ILabelChangeActionResponse,
} from 'model/stores/clusterlabels/types';

import { createAsynchronousAction } from '../asynchronousAction';

export const updateClusterLabels = createAsynchronousAction<
  ILabelChangeActionPayload,
  void,
  void | ILabelChangeActionResponse
>({
  actionTypePrefix: UPDATE_CLUSTER_LABELS,
  perform: async (_s, _d, payload) => {
    if (payload) {
      const labelsPayload = {
        [payload.key]: payload.value,
      };
      if (payload.replaceLabelWithKey) {
        labelsPayload[payload.replaceLabelWithKey] = null;
      }

      const api = new GiantSwarm.ClusterLabelsApi();
      const resp = await api.setClusterLabels(payload.clusterId, {
        labels: labelsPayload,
      });

      return {
        clusterId: payload.clusterId,
        labels: filterLabels(resp.labels) as V5ClusterLabelsProperty,
      };
    }

    return Promise.resolve();
  },
  shouldPerform: () => true,
  throwOnError: false,
});
