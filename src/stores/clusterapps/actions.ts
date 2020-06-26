import { createAppConfig } from 'actions/appConfigActions';
import { createAppSecret } from 'actions/appSecretActions';
import GiantSwarm, { V4App } from 'giantswarm';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { IState } from 'reducers/types';
import { StatusCodes } from 'shared/constants';

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
  IState,
  ILoadClusterAppsResponse
>({
  actionTypePrefix: 'LOAD_CLUSTER_APPS',

  perform: async (state, _dispatch, payload) => {
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
  throwOnError: false,
});

interface IInstallAppRequestApp {
  name: string;
  valuesYAML: string;
  secretsYAML: string;
  catalog: string;
  namespace: string;
  version: string;
  chartName: string;
}

interface IInstallAppRequest {
  clusterId: string;
  app: IInstallAppRequestApp;
}

interface IInstallAppResponse {
  clusterId: string;
}

export const installApp = createAsynchronousAction<
  IInstallAppRequest,
  IState,
  IInstallAppResponse
>({
  actionTypePrefix: 'INSTALL_APP',

  perform: async (state, dispatch, payload) => {
    if (!payload || !payload.clusterId || !payload.app) {
      throw new TypeError(
        'request payload cannot be undefined and must contain a clusterId and an app to install'
      );
    }

    const appsApi = new GiantSwarm.AppsApi();

    const v5Clusters = state.entities.clusters.v5Clusters;
    const isV5Cluster = v5Clusters.includes(payload.clusterId);

    let createApp = appsApi.createClusterAppV4.bind(appsApi);

    if (isV5Cluster) {
      createApp = appsApi.createClusterAppV5.bind(appsApi);
    }

    if (Object.keys(payload.app.valuesYAML).length !== 0) {
      await dispatch(
        createAppConfig(
          payload.app.name,
          payload.clusterId,
          payload.app.valuesYAML
        )
      );
    }

    if (Object.keys(payload.app.secretsYAML).length !== 0) {
      await dispatch(
        createAppSecret(
          payload.app.name,
          payload.clusterId,
          payload.app.secretsYAML
        )
      );
    }

    await createApp(payload.clusterId, payload.app.name, {
      body: {
        spec: {
          catalog: payload.app.catalog,
          name: payload.app.chartName,
          namespace: payload.app.namespace,
          version: payload.app.version,
        },
      },
    }).catch((error) => {
      showAppInstallationErrorFlashMessage(
        payload.app.name,
        payload.clusterId,
        error
      );
      throw error;
    });

    new FlashMessage(
      `Your app <code>${payload.app.name}</code> is being installed on <code>${payload.clusterId}</code>`,
      messageType.SUCCESS,
      messageTTL.MEDIUM
    );

    return {
      clusterId: payload.clusterId,
    };
  },
  shouldPerform: () => true,
  throwOnError: true,
});

/**
 * appInstallationErrorFlashMessage provides flash messages for failed app creation.
 *
 * @param {string} appName Name of the app.
 * @param {string} clusterID Where we tried to install the app on.
 * @param {object} error The error that occured.
 */
function showAppInstallationErrorFlashMessage(
  appName: string,
  clusterID: string,
  error: { status: number }
) {
  if (error.status === StatusCodes.Conflict) {
    new FlashMessage(
      `An app called <code>${appName}</code> already exists on cluster <code>${clusterID}</code>`,
      messageType.ERROR,
      messageTTL.LONG
    );
  } else if (error.status === StatusCodes.ServiceUnavailable) {
    new FlashMessage(
      `The cluster is not yet ready for app installation. Please try again in 5 to 10 minutes.`,
      messageType.ERROR,
      messageTTL.LONG
    );
  } else if (error.status === StatusCodes.BadRequest) {
    new FlashMessage(
      `Your input appears to be invalid. Please make sure all fields are filled in correctly.`,
      messageType.ERROR,
      messageTTL.LONG
    );
  } else {
    new FlashMessage(
      `Something went wrong while trying to install your app. Please try again later or contact support: support@giantswarm.io`,
      messageType.ERROR,
      messageTTL.LONG
    );
  }
}
