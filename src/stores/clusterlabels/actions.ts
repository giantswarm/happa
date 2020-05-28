import GiantSwarm, { V5ClusterLabelsProperty } from 'giantswarm';
import { filterLabels } from 'utils/clusterUtils';

import { createAsynchronousAction } from '../asynchronousAction';

interface ILabelChangeResponse {
  clusterId: string;
  labels: V5ClusterLabelsProperty;
}

export const updateClusterLabels = createAsynchronousAction<
  ILabelChangeRequest,
  void,
  void | ILabelChangeResponse
>({
  actionTypePrefix: 'UPDATE_CLUSTER_LABELS',
  perform: async (_, payload) => {
    if (payload) {
      const api = new GiantSwarm.ClusterLabelsApi();
      const resp = await api.setClusterLabels(payload.clusterId, {
        labels: { [payload.key]: payload.value },
      });

      return {
        clusterId: payload.clusterId,
        labels: filterLabels(resp.labels) as V5ClusterLabelsProperty,
      };
    }

    return Promise.resolve();
  },
  shouldPerform: () => true,
});
