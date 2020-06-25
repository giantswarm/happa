import GiantSwarm, { V4App } from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';

import { createAsynchronousAction } from '../asynchronousAction';

interface ILoadClusterAppsRequest {
  clusterId: string;
}

interface ILoadClusterAppsResponse {
  apps: V4App[];
  clusterId: string;
}

export const loadClusterApps = createAsynchronousAction<
  ILoadClusterAppsRequest,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  any,
  ILoadClusterAppsResponse
>({
  actionTypePrefix: 'LOAD_CLUSTER_APPS',

  perform: async (state, payload) => {
    if (!payload || !payload.clusterId) {
      throw new TypeError(
        'request payload cannot be undefined and must contain a clusterId'
      );
    }

    const appsApi = new GiantSwarm.AppsApi();

    const v5Clusters = state.entities.clusters.v5Clusters || [];
    const isV5Cluster = v5Clusters.includes(payload.clusterId);

    let getClusterApps = appsApi.getClusterAppsV4.bind(appsApi);

    if (isV5Cluster) {
      getClusterApps = appsApi.getClusterAppsV5.bind(appsApi);
    }

    try {
      let apps = await getClusterApps(payload.clusterId);
      apps = Array.from(apps);

      return {
        apps: apps,
        clusterId: payload.clusterId,
      };
    } catch (error) {
      new FlashMessage(
        'Something went wrong while trying to load apps installed on this cluster.',
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      throw error;
    }
  },
  shouldPerform: () => true,
});
