import GiantSwarm from 'giantswarm';
import yaml from 'js-yaml';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { ThunkAction } from 'redux-thunk';
import { Constants, StatusCodes } from 'shared/constants';
import {
  CATALOG_LOAD_INDEX_ERROR,
  CATALOG_LOAD_INDEX_REQUEST,
  CATALOG_LOAD_INDEX_SUCCESS,
  CATALOGS_LIST,
  CLUSTER_CREATE_APP_CONFIG_ERROR,
  CLUSTER_CREATE_APP_CONFIG_REQUEST,
  CLUSTER_CREATE_APP_CONFIG_SUCCESS,
  CLUSTER_CREATE_APP_SECRET_ERROR,
  CLUSTER_CREATE_APP_SECRET_REQUEST,
  CLUSTER_CREATE_APP_SECRET_SUCCESS,
  CLUSTER_DELETE_APP_CONFIG_ERROR,
  CLUSTER_DELETE_APP_CONFIG_REQUEST,
  CLUSTER_DELETE_APP_CONFIG_SUCCESS,
  CLUSTER_DELETE_APP_SECRET_ERROR,
  CLUSTER_DELETE_APP_SECRET_REQUEST,
  CLUSTER_DELETE_APP_SECRET_SUCCESS,
  CLUSTER_LOAD_APP_README_ERROR,
  CLUSTER_LOAD_APP_README_REQUEST,
  CLUSTER_LOAD_APP_README_SUCCESS,
  CLUSTER_UPDATE_APP_CONFIG_ERROR,
  CLUSTER_UPDATE_APP_CONFIG_REQUEST,
  CLUSTER_UPDATE_APP_CONFIG_SUCCESS,
  CLUSTER_UPDATE_APP_SECRET_ERROR,
  CLUSTER_UPDATE_APP_SECRET_REQUEST,
  CLUSTER_UPDATE_APP_SECRET_SUCCESS,
  DELETE_CLUSTER_APP,
  DISABLE_CATALOG,
  ENABLE_CATALOG,
  INSTALL_APP,
  INSTALL_INGRESS_APP,
  LOAD_CLUSTER_APPS,
  PREPARE_INGRESS_TAB_DATA,
  SET_APP_SEARCH_QUERY,
  SET_APP_SORT_ORDER,
  UPDATE_CLUSTER_APP,
} from 'stores/appcatalog/constants';
import {
  selectIngressCatalog,
  selectReadmeURL,
} from 'stores/appcatalog/selectors';
import {
  AppCatalogActions,
  IAppCatalogDeleteClusterAppActionPayload,
  IAppCatalogDeleteClusterAppActionResponse,
  IAppCatalogDisableCatalogAction,
  IAppCatalogInstallAppActionPayload,
  IAppCatalogInstallAppActionResponse,
  IAppCatalogLoadClusterAppsActionPayload,
  IAppCatalogLoadClusterAppsActionResponse,
  IAppCatalogSetAppSearchQuery,
  IAppCatalogSetAppSortOrder,
  IAppCatalogsMap,
  IAppCatalogUpdateClusterAppActionPayload,
  IAppCatalogUpdateClusterAppActionResponse,
  IInstallIngressActionPayload,
} from 'stores/appcatalog/types';
import { v4orV5 } from 'stores/cluster/utils';
import { IState } from 'stores/state';

import { createAsynchronousAction } from '../asynchronousAction';
import { normalizeAppCatalogIndexURL } from './utils';

export const listCatalogs = createAsynchronousAction<
  undefined,
  IState,
  IAppCatalogsMap
>({
  actionTypePrefix: CATALOGS_LIST,

  perform: async (): Promise<IAppCatalogsMap> => {
    let catalogs: IAppCatalog[] = [];

    const appsApi = new GiantSwarm.AppsApi();
    const catalogsIterable = await appsApi.getAppCatalogs(); // Use model layer?
    catalogs = Array.from(catalogsIterable);

    // Turn the array response into a hash where the keys are the catalog names.
    const catalogsHash = catalogs.reduce(
      (agg: IAppCatalogsMap, currCatalog: IAppCatalog) => {
        currCatalog.isFetchingIndex = false;

        agg[currCatalog.metadata.name] = currCatalog;

        return agg;
      },
      {}
    );

    return catalogsHash;
  },
  shouldPerform: () => true,
  throwOnError: false,
});

export function catalogLoadIndex(
  catalogName: string
): ThunkAction<Promise<void>, IState, void, AppCatalogActions> {
  return async (dispatch, getState) => {
    try {
      const currCatalog: IAppCatalog | undefined = getState().entities.catalogs
        .items[catalogName];
      if (currCatalog?.apps || currCatalog?.isFetchingIndex) {
        // Skip if we already have apps loaded.
        return Promise.resolve();
      }

      dispatch({
        type: CATALOG_LOAD_INDEX_REQUEST,
        catalogName: catalogName,
        id: catalogName,
      });

      const catalogWithApps = await loadIndexForCatalog(currCatalog);
      dispatch({
        type: CATALOG_LOAD_INDEX_SUCCESS,
        catalog: catalogWithApps,
        id: catalogName,
      });

      return Promise.resolve();
    } catch (err) {
      const message = (err as Error).message ?? (err as string);
      dispatch({
        type: CATALOG_LOAD_INDEX_ERROR,
        error: message,
        catalogName: catalogName,
        id: catalogName,
      });

      ErrorReporter.getInstance().notify(err);

      return Promise.resolve();
    }
  };
}

async function loadIndexForCatalog(catalog: IAppCatalog): Promise<IAppCatalog> {
  const indexURL = normalizeAppCatalogIndexURL(catalog.spec.storage.URL);

  const response = await fetch(indexURL, { mode: 'cors' });
  if (response.status !== StatusCodes.Ok) {
    return Promise.reject(
      new Error(
        `Could not fetch ${indexURL}. (Host '${catalog.spec.storage.URL}' Status ${response.status}`
      )
    );
  }

  const responseText = await response.text();
  const rawCatalog = yaml.load(responseText) as IAppCatalogYAML;
  const catalogWithApps: IAppCatalog = Object.assign({}, catalog, {
    apps: rawCatalog.entries,
  });

  return catalogWithApps;
}

/**
 * Takes a catalogName and an appVersion (which is a complex object, and must have a sources field)
 * and attempts to fetch the README it finds in the sources field.
 *
 * @param {string} catalogName The name of the catalog that the appVersion can be found in (Reducer needs to know this to update the store correctly)
 * @param {Object} appVersion An appVersion object, which is a single entry in the apps field of a catalog, referencing a specific version of an app.
 * @param {String[]} appVersion.sources[] A URL, ending in README.md
 */
export function loadAppReadme(
  catalogName: string,
  appVersion: IAppCatalogAppVersion
): ThunkAction<Promise<void>, IState, void, AppCatalogActions> {
  return async (dispatch) => {
    dispatch({
      type: CLUSTER_LOAD_APP_README_REQUEST,
      catalogName,
      appVersion,
    });

    let readmeURL = selectReadmeURL(appVersion);
    if (!readmeURL) {
      dispatch({
        type: CLUSTER_LOAD_APP_README_ERROR,
        catalogName,
        appVersion,
        error: 'This app does not reference a README file.',
      });

      return Promise.resolve();
    }
    readmeURL = fixTestAppReadmeURLs(readmeURL);

    try {
      const response = await fetch(readmeURL, { mode: 'cors' });
      if (response.status !== StatusCodes.Ok) {
        throw new Error(
          `Error fetching Readme. Response Status: ${response.status}`
        );
      }
      const readmeText = await response.text();

      dispatch({
        type: CLUSTER_LOAD_APP_README_SUCCESS,
        catalogName,
        appVersion,
        readmeText,
      });

      return Promise.resolve();
    } catch (error) {
      const errorMessage = `Error fetching readme at: "${readmeURL}" .`;
      dispatch({
        type: CLUSTER_LOAD_APP_README_ERROR,
        catalogName,
        appVersion,
        error: errorMessage,
      });

      ErrorReporter.getInstance().notify(error);

      return Promise.resolve();
    }
  };
}

/**
 * Looks at a readme URL and attempts to correct URLs
 * which are known not to work. Test apps have a version which is not yet
 * tagged in the git repo, but the path includes the commit sha, so we can
 * still get to the file at that commit.
 * @param readmeURL - A URL that may or may not point to a README of a test app.
 */
function fixTestAppReadmeURLs(readmeURL: string): string {
  /**
   * Test app urls will have a semver version followed by a hyphen followed by
   * a long commit sha. We need to remove the version part. If the regex
   * doesn't match, then the string is returned as is.
   * https://regex101.com/r/K2dxdN/1
   */

  const escapedReadmeFile = Constants.README_FILE.replace('.', '\\.');
  const regexMatcher = new RegExp(
    `^(.*)\/v?[0-9]+\.[0-9]+\.[0-9]+-(.*)\/${escapedReadmeFile}$`
  );
  const fixedReadmeURL = readmeURL.replace(
    regexMatcher,
    `$1/$2/${Constants.README_FILE}`
  );

  return fixedReadmeURL;
}

export function updateAppConfig(
  appName: string,
  clusterID: string,
  values: string
): ThunkAction<Promise<void>, IState, void, AppCatalogActions> {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: CLUSTER_UPDATE_APP_CONFIG_REQUEST,
        clusterID,
        appName,
      });

      const v5Clusters = getState().entities.clusters.v5Clusters;
      const isV5Cluster = v5Clusters.includes(clusterID);

      const appConfigsApi = new GiantSwarm.AppConfigsApi();
      let updateClusterAppConfig = appConfigsApi.modifyClusterAppConfigV4.bind(
        appConfigsApi
      );
      if (isV5Cluster) {
        updateClusterAppConfig = appConfigsApi.modifyClusterAppConfigV5.bind(
          appConfigsApi
        );
      }

      await updateClusterAppConfig(clusterID, appName, {
        body: values,
      });
      dispatch({
        type: CLUSTER_UPDATE_APP_CONFIG_SUCCESS,
        clusterID,
        appName,
      });

      new FlashMessage(
        `The ConfigMap containing the user level config values of <code>${appName}</code> on <code>${clusterID}</code> has successfully been updated.`,
        messageType.SUCCESS,
        messageTTL.LONG
      );
    } catch (err) {
      dispatch({
        type: CLUSTER_UPDATE_APP_CONFIG_ERROR,
        clusterID,
        appName,
      });

      if (err.status === StatusCodes.NotFound) {
        new FlashMessage(
          `Could not find an app or ConfigMap containing user level config values to update for <code>${appName}</code> on cluster <code>${clusterID}</code>`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else if (err.status === StatusCodes.BadRequest) {
        new FlashMessage(
          `The request appears to be invalid. Please make sure all fields are filled in correctly.`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          `Something went wrong while trying to update the ConfigMap containing user level config values. Please try again later or contact support: support@giantswarm.io`,
          messageType.ERROR,
          messageTTL.LONG
        );
      }

      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function createAppConfig(
  appName: string,
  clusterID: string,
  values: string | null
): ThunkAction<Promise<void>, IState, void, AppCatalogActions> {
  return async (dispatch, getState) => {
    try {
      if (!values) {
        // Skip creating an empty app config.
        return;
      }

      dispatch({
        type: CLUSTER_CREATE_APP_CONFIG_REQUEST,
        clusterID,
        appName,
      });

      const v5Clusters = getState().entities.clusters.v5Clusters;
      const isV5Cluster = v5Clusters.includes(clusterID);

      const appConfigsApi = new GiantSwarm.AppConfigsApi();
      let createClusterAppConfig = appConfigsApi.createClusterAppConfigV4.bind(
        appConfigsApi
      );
      if (isV5Cluster) {
        createClusterAppConfig = appConfigsApi.createClusterAppConfigV5.bind(
          appConfigsApi
        );
      }

      await createClusterAppConfig(clusterID, appName, {
        body: values,
      });
      dispatch({
        type: CLUSTER_CREATE_APP_CONFIG_SUCCESS,
        clusterID,
        appName,
      });

      new FlashMessage(
        `A ConfigMap containing user level config values for <code>${appName}</code> on <code>${clusterID}</code> has successfully been created.`,
        messageType.SUCCESS,
        messageTTL.LONG
      );
    } catch (err) {
      dispatch({
        type: CLUSTER_CREATE_APP_CONFIG_ERROR,
        clusterID,
        appName,
      });

      if (err.status === StatusCodes.NotFound) {
        new FlashMessage(
          `Could not find app <code>${appName}</code> on cluster <code>${clusterID}</code>`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else if (err.status === StatusCodes.BadRequest) {
        new FlashMessage(
          `The request appears to be invalid. Please make sure all fields are filled in correctly.`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          `Something went wrong while trying to create a ConfigMap to store your values. Please try again later or contact support: support@giantswarm.io`,
          messageType.ERROR,
          messageTTL.LONG
        );
      }

      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function deleteAppConfig(
  appName: string,
  clusterID: string
): ThunkAction<Promise<void>, IState, void, AppCatalogActions> {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: CLUSTER_DELETE_APP_CONFIG_REQUEST,
        clusterID,
        appName,
      });

      const v5Clusters = getState().entities.clusters.v5Clusters;
      const isV5Cluster = v5Clusters.includes(clusterID);

      const appConfigsApi = new GiantSwarm.AppConfigsApi();
      let deleteClusterAppConfig = appConfigsApi.deleteClusterAppConfigV4.bind(
        appConfigsApi
      );
      if (isV5Cluster) {
        deleteClusterAppConfig = appConfigsApi.deleteClusterAppConfigV5.bind(
          appConfigsApi
        );
      }

      await deleteClusterAppConfig(clusterID, appName);
      dispatch({
        type: CLUSTER_DELETE_APP_CONFIG_SUCCESS,
        clusterID,
        appName,
      });

      new FlashMessage(
        `The ConfigMap containing user level config values for <code>${appName}</code> on <code>${clusterID}</code> has been deleted.`,
        messageType.SUCCESS,
        messageTTL.MEDIUM
      );
    } catch (err) {
      dispatch({
        type: CLUSTER_DELETE_APP_CONFIG_ERROR,
        clusterID,
        appName,
      });

      if (err.status === StatusCodes.NotFound) {
        new FlashMessage(
          `Could not find the ConfigMap containing user level config values for the app called <code>${appName}</code> on cluster <code>${clusterID}</code>`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else if (err.status === StatusCodes.BadRequest) {
        new FlashMessage(
          `The request appears to be invalid. Please try again later or contact support: support@giantswarm.io.`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          `Something went wrong while trying to delete the ConfigMap containing your values. Please try again later or contact support: support@giantswarm.io`,
          messageType.ERROR,
          messageTTL.LONG
        );
      }

      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function updateAppSecret(
  appName: string,
  clusterID: string,
  values: string
): ThunkAction<Promise<void>, IState, void, AppCatalogActions> {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: CLUSTER_UPDATE_APP_SECRET_REQUEST,
        clusterID,
        appName,
      });

      const v5Clusters = getState().entities.clusters.v5Clusters;
      const isV5Cluster = v5Clusters.includes(clusterID);

      const appSecretsApi = new GiantSwarm.AppSecretsApi();
      let updateClusterAppSecret = appSecretsApi.modifyClusterAppSecretV4.bind(
        appSecretsApi
      );
      if (isV5Cluster) {
        updateClusterAppSecret = appSecretsApi.modifyClusterAppSecretV5.bind(
          appSecretsApi
        );
      }

      await updateClusterAppSecret(clusterID, appName, {
        body: values,
      });
      dispatch({
        type: CLUSTER_UPDATE_APP_SECRET_SUCCESS,
        clusterID,
        appName,
      });

      new FlashMessage(
        `The Secret containing user level secret values of <code>${appName}</code> on <code>${clusterID}</code> has successfully been updated.`,
        messageType.SUCCESS,
        messageTTL.LONG
      );
    } catch (err) {
      dispatch({
        type: CLUSTER_UPDATE_APP_SECRET_ERROR,
        clusterID,
        appName,
      });

      if (err.status === StatusCodes.NotFound) {
        new FlashMessage(
          `Could not find an app or Secret containing user level secret values to update for <code>${appName}</code> on cluster <code>${clusterID}</code>`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else if (err.status === StatusCodes.BadRequest) {
        new FlashMessage(
          `The request appears to be invalid. Please make sure all fields are filled in correctly.`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          `Something went wrong while trying to update the Secret containing user level secret values. Please try again later or contact support: support@giantswarm.io`,
          messageType.ERROR,
          messageTTL.LONG
        );
      }

      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function createAppSecret(
  appName: string,
  clusterID: string,
  values: string | null
): ThunkAction<Promise<void>, IState, void, AppCatalogActions> {
  return async (dispatch, getState) => {
    try {
      if (!values) {
        // Skip creating an empty app secret.
        return;
      }

      dispatch({
        type: CLUSTER_CREATE_APP_SECRET_REQUEST,
        clusterID,
        appName,
      });

      const v5Clusters = getState().entities.clusters.v5Clusters;
      const isV5Cluster = v5Clusters.includes(clusterID);

      const appSecretsApi = new GiantSwarm.AppSecretsApi();
      let createClusterAppSecret = appSecretsApi.createClusterAppSecretV4.bind(
        appSecretsApi
      );
      if (isV5Cluster) {
        createClusterAppSecret = appSecretsApi.createClusterAppSecretV5.bind(
          appSecretsApi
        );
      }

      await createClusterAppSecret(clusterID, appName, { body: values });
      dispatch({
        type: CLUSTER_CREATE_APP_SECRET_SUCCESS,
        clusterID,
        appName,
      });

      new FlashMessage(
        `A Secret containing user level secret values for <code>${appName}</code> on <code>${clusterID}</code> has successfully been created.`,
        messageType.SUCCESS,
        messageTTL.LONG
      );
    } catch (err) {
      dispatch({
        type: CLUSTER_CREATE_APP_SECRET_ERROR,
        clusterID,
        appName,
      });

      if (err.status === StatusCodes.NotFound) {
        new FlashMessage(
          `Could not find <code>${appName}</code> on cluster <code>${clusterID}</code>`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else if (err.status === StatusCodes.BadRequest) {
        new FlashMessage(
          `The request appears to be invalid. Please make sure all fields are filled in correctly.`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          `Something went wrong while trying to create the Secret containing your values. Please try again later or contact support: support@giantswarm.io`,
          messageType.ERROR,
          messageTTL.LONG
        );
      }

      ErrorReporter.getInstance().notify(err);
    }
  };
}

export function deleteAppSecret(
  appName: string,
  clusterID: string
): ThunkAction<Promise<void>, IState, void, AppCatalogActions> {
  return async (dispatch, getState) => {
    try {
      dispatch({
        type: CLUSTER_DELETE_APP_SECRET_REQUEST,
        clusterID,
        appName,
      });

      const v5Clusters = getState().entities.clusters.v5Clusters;
      const isV5Cluster = v5Clusters.includes(clusterID);

      const appSecretsApi = new GiantSwarm.AppSecretsApi();
      let deleteClusterAppSecret = appSecretsApi.deleteClusterAppSecretV4.bind(
        appSecretsApi
      );
      if (isV5Cluster) {
        deleteClusterAppSecret = appSecretsApi.deleteClusterAppSecretV5.bind(
          appSecretsApi
        );
      }

      await deleteClusterAppSecret(clusterID, appName);
      dispatch({
        type: CLUSTER_DELETE_APP_SECRET_SUCCESS,
        clusterID,
        appName,
      });

      new FlashMessage(
        `The Secret containing user level secret values for <code>${appName}</code> on <code>${clusterID}</code> has been deleted.`,
        messageType.SUCCESS,
        messageTTL.MEDIUM
      );
    } catch (err) {
      dispatch({
        type: CLUSTER_DELETE_APP_SECRET_ERROR,
        clusterID,
        appName,
      });

      if (err.status === StatusCodes.NotFound) {
        new FlashMessage(
          `Could not find the Secret containing user level secret values for an app called <code>${appName}</code> on cluster <code>${clusterID}</code>`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else if (err.status === StatusCodes.BadRequest) {
        new FlashMessage(
          `The request appears to be invalid. Please try again later or contact support: support@giantswarm.io.`,
          messageType.ERROR,
          messageTTL.LONG
        );
      } else {
        new FlashMessage(
          `Something went wrong while trying to delete the Secret. Please try again later or contact support: support@giantswarm.io`,
          messageType.ERROR,
          messageTTL.LONG
        );
      }
    }
  };
}

export const updateClusterApp = createAsynchronousAction<
  IAppCatalogUpdateClusterAppActionPayload,
  IState,
  IAppCatalogUpdateClusterAppActionResponse
>({
  actionTypePrefix: UPDATE_CLUSTER_APP,
  perform: async (state, _dispatch, payload) => {
    if (!payload) {
      return Promise.reject(
        new TypeError('request payload cannot be undefined')
      );
    }

    const { appName, clusterId, version } = payload;

    const appsApi = new GiantSwarm.AppsApi();

    const modifyApp = v4orV5(
      appsApi.modifyClusterAppV4.bind(appsApi),
      appsApi.modifyClusterAppV5.bind(appsApi),
      clusterId,
      state
    );

    try {
      await modifyApp(clusterId, appName, { body: { spec: { version } } });

      new FlashMessage(
        `App <code>${appName}</code> on <code>${clusterId}</code> has been updated. Changes might take some time to take effect.`,
        messageType.SUCCESS,
        messageTTL.LONG
      );

      return {
        error: '',
      };
    } catch (error) {
      const errorMessage =
        error?.message ||
        'Something went wrong while trying to update your app. Please try again later or contact support.';

      return Promise.reject(new Error(errorMessage));
    }
  },
  shouldPerform: () => true,
  throwOnError: false,
});

export const deleteClusterApp = createAsynchronousAction<
  IAppCatalogDeleteClusterAppActionPayload,
  IState,
  IAppCatalogDeleteClusterAppActionResponse
>({
  actionTypePrefix: DELETE_CLUSTER_APP,
  perform: async (state, _dispatch, payload) => {
    if (!payload) {
      return Promise.reject(
        new TypeError('request payload cannot be undefined')
      );
    }

    const { appName, clusterId } = payload;

    const appsApi = new GiantSwarm.AppsApi();

    const deleteApp = v4orV5(
      appsApi.deleteClusterAppV4.bind(appsApi),
      appsApi.deleteClusterAppV5.bind(appsApi),
      clusterId,
      state
    );

    try {
      await deleteApp(clusterId, appName);

      new FlashMessage(
        `App <code>${appName}</code> was scheduled for deletion on <code>${clusterId}</code>. This may take a couple of minutes.`,
        messageType.SUCCESS,
        messageTTL.LONG
      );

      return { appName, clusterId };
    } catch (error) {
      new FlashMessage(
        `Something went wrong while trying to delete your app. Please try again later or contact support: support@giantswarm.io`,
        messageType.ERROR,
        messageTTL.LONG
      );

      return Promise.reject(error);
    }
  },
  shouldPerform: () => true,
  throwOnError: false,
});

export const loadClusterApps = createAsynchronousAction<
  IAppCatalogLoadClusterAppsActionPayload,
  IState,
  IAppCatalogLoadClusterAppsActionResponse
>({
  actionTypePrefix: LOAD_CLUSTER_APPS,

  perform: async (state, _dispatch, payload) => {
    if (!payload || !payload.clusterId) {
      return Promise.reject(
        new TypeError(
          'request payload cannot be undefined and must contain a clusterId'
        )
      );
    }

    const appsApi = new GiantSwarm.AppsApi();

    const getClusterApps = v4orV5(
      appsApi.getClusterAppsV4.bind(appsApi),
      appsApi.getClusterAppsV5.bind(appsApi),
      payload.clusterId,
      state
    );

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

      return Promise.reject(error);
    }
  },
  shouldPerform: () => true,
  throwOnError: false,
});

export const installApp = createAsynchronousAction<
  IAppCatalogInstallAppActionPayload,
  IState,
  IAppCatalogInstallAppActionResponse
>({
  actionTypePrefix: INSTALL_APP,

  perform: async (state, dispatch, payload) => {
    if (!payload) {
      return Promise.reject(new TypeError('action payload cannot be empty'));
    }

    const {
      name,
      valuesYAML,
      secretsYAML,
      catalog,
      chartName,
      namespace,
      version,
    } = payload.app;

    const clusterId = payload.clusterId;

    await dispatch(createAppConfig(name, clusterId, valuesYAML));
    await dispatch(createAppSecret(name, clusterId, secretsYAML));

    const request = {
      body: {
        spec: {
          catalog: catalog,
          name: chartName,
          namespace: namespace,
          version: version,
        },
      },
    };

    const appsApi = new GiantSwarm.AppsApi();

    const createApp = v4orV5(
      appsApi.createClusterAppV4.bind(appsApi),
      appsApi.createClusterAppV5.bind(appsApi),
      payload.clusterId,
      state
    );

    try {
      await createApp(clusterId, name, request);
    } catch (error) {
      if (error.status === StatusCodes.Conflict) {
        new FlashMessage(
          `An app called <code>${name}</code> already exists on cluster <code>${clusterId}</code>`,
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

      return Promise.reject(error);
    }

    new FlashMessage(
      `Your app <code>${name}</code> is being installed on <code>${clusterId}</code>`,
      messageType.SUCCESS,
      messageTTL.MEDIUM
    );

    return Promise.resolve({
      clusterId: clusterId,
    });
  },
  shouldPerform: () => true,
  throwOnError: true,
});

export const installLatestIngress = createAsynchronousAction<
  IInstallIngressActionPayload,
  IState,
  void
>({
  actionTypePrefix: INSTALL_INGRESS_APP,
  perform: async (state, dispatch, payload) => {
    if (!payload?.clusterId) {
      return Promise.reject(
        new TypeError('request payload cannot be undefined')
      );
    }

    try {
      // These type casts are safe due to the checks in `shouldPerform()`.
      const gsCatalog = selectIngressCatalog(state) as IAppCatalog;
      const { name, version } = (gsCatalog.apps as IAppCatalogAppMap)[
        Constants.INSTALL_INGRESS_TAB_APP_NAME
      ][0];

      const appToInstall = {
        name,
        chartName: name,
        version,
        catalog: Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME,
        namespace: 'kube-system',
        valuesYAML: '',
        secretsYAML: '',
      };

      await dispatch(
        installApp({ app: appToInstall, clusterId: payload.clusterId })
      );
      await dispatch(loadClusterApps({ clusterId: payload.clusterId }));

      return Promise.resolve();
    } catch (e) {
      // report the error
      const errorReporter = ErrorReporter.getInstance();
      errorReporter.notify(e);

      // show error
      let errorMessage =
        'Something went wrong while trying to install Ingress Controller App.';
      if (e.response?.message || e.message) {
        errorMessage = `There was a problem trying to install Ingress Controller App: ${
          e.response?.message ?? e.message
        }`;
      }

      new FlashMessage(
        errorMessage,
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      return Promise.reject(e);
    }
  },
  shouldPerform: (state): boolean => {
    // only allow performing if we have loaded the catalog and have a version
    const gsCatalog = selectIngressCatalog(state);
    const app = gsCatalog?.apps?.[Constants.INSTALL_INGRESS_TAB_APP_NAME]?.[0];

    return typeof gsCatalog !== 'undefined' && typeof app !== 'undefined';
  },
  throwOnError: false,
});

export const prepareIngressTabData = createAsynchronousAction<
  IInstallIngressActionPayload,
  IState,
  void
>({
  actionTypePrefix: PREPARE_INGRESS_TAB_DATA,
  perform: async (state, dispatch, payload) => {
    if (!payload?.clusterId) {
      return Promise.reject(
        new TypeError('request payload cannot be undefined')
      );
    }

    try {
      const gsCatalog = selectIngressCatalog(state) as IAppCatalog;

      await Promise.all([
        dispatch(loadClusterApps({ clusterId: payload.clusterId })),
        dispatch(catalogLoadIndex(gsCatalog.metadata.name)),
      ]);

      return Promise.resolve();
    } catch (e) {
      // report the error
      const errorReporter = ErrorReporter.getInstance();
      errorReporter.notify(e);

      // show error
      let errorMessage =
        'Something went wrong while preparing data for Ingress Controller App installation.';
      if (e.response?.message || e.message) {
        errorMessage = `There was a problem preparing data for Ingress Controller App installation: ${
          e.response?.message ?? e.message
        }`;
      }

      new FlashMessage(
        errorMessage,
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again later or contact support: support@giantswarm.io'
      );

      return Promise.reject(e);
    }
  },
  shouldPerform: (state: IState): boolean => {
    const gsCatalog = selectIngressCatalog(state);

    return typeof gsCatalog !== 'undefined';
  },
  throwOnError: false,
});

export function enableCatalog(
  catalogName: string
): ThunkAction<Promise<void>, IState, void, AppCatalogActions> {
  return async (dispatch) => {
    dispatch({
      type: ENABLE_CATALOG,
      catalog: catalogName,
    });

    await dispatch(catalogLoadIndex(catalogName));
  };
}

export const disableCatalog = (
  catalogName: string
): IAppCatalogDisableCatalogAction => {
  return {
    type: DISABLE_CATALOG,
    catalog: catalogName,
  };
};

export const setAppSearchQuery = (
  query: string
): IAppCatalogSetAppSearchQuery => {
  return {
    type: SET_APP_SEARCH_QUERY,
    query,
  };
};
export const setAppSortOrder = (order: string): IAppCatalogSetAppSortOrder => {
  return {
    type: SET_APP_SORT_ORDER,
    order,
  };
};
