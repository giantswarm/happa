import produce from 'immer';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { compare } from 'lib/semver';
import { VersionImpl } from 'lib/Version';
import * as releasesUtils from 'MAPI/releases/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import { IHttpClient } from 'model/clients/HttpClient';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as corev1 from 'model/services/mapi/corev1';
import * as metav1 from 'model/services/mapi/metav1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import { AppConstants, Constants } from 'shared/constants';
import { mutate } from 'swr';

function getUserConfigMapName(appName: string): string {
  return `${appName}-user-values`;
}

function getUserSecretName(appName: string): string {
  return `${appName}-user-secrets`;
}

function getClusterConfigMapName(clusterID: string, appName: string): string {
  if (appName === 'nginx-ingress-controller-app') {
    return 'ingress-controller-values';
  }

  return `${clusterID}-cluster-values`;
}

function getKubeConfigSecretName(clusterID: string): string {
  return `${clusterID}-kubeconfig`;
}

/**
 * Make sure that an app has a `ConfigMap` with the given contents.
 *
 * If a `ConfigMap` already exists, then its contents will be updated.
 * If it doesn't exist, it will be created. Keep in mind that
 * if an empty string is given, the `ConfigMap` will not be created.
 * @param client
 * @param auth
 * @param namespace
 * @param name
 * @param contents
 */
async function ensureAppUserConfigMap(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string,
  contents: string
): Promise<corev1.IConfigMap | null> {
  try {
    const cr = await corev1.getConfigMap(client, auth, name, namespace);
    cr.data = {
      values: contents,
    };

    return corev1.updateConfigMap(client, auth, cr);
  } catch (err) {
    if (
      !metav1.isStatusError(
        (err as GenericResponse).data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      return Promise.reject(err);
    }
  }

  if (contents.length < 1) return null;

  const cr: corev1.IConfigMap = {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name,
      namespace,
    },
    data: {
      values: contents,
    },
  };

  return corev1.createConfigMap(client, auth, cr);
}

/**
 * Make sure that an app has a `Secret` with the given contents.
 *
 * If a `Secret` already exists, then its contents will be updated.
 * If it doesn't exist, it will be created. Keep in mind that
 * if an empty string is given, the `Secret` will not be created.
 * @param client
 * @param auth
 * @param namespace
 * @param name
 * @param contents
 */
async function ensureAppUserSecret(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string,
  contents: string
): Promise<corev1.ISecret | null> {
  try {
    const cr = await corev1.getSecret(client, auth, name, namespace);
    cr.stringData = {
      values: contents,
    };

    return corev1.updateSecret(client, auth, cr);
  } catch (err) {
    if (
      !metav1.isStatusError(
        (err as GenericResponse).data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      return Promise.reject(err);
    }
  }

  if (contents.length < 1) return null;

  const cr: corev1.ISecret = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name,
      namespace,
    },
    stringData: {
      values: contents,
    },
  };

  return corev1.createSecret(client, auth, cr);
}

export interface IAppConfig {
  name: string;
  namespace: string;
  version: string;
  chartName: string;
  catalogName: string;
  configMapContents: string;
  secretContents: string;
}

/**
 * Install an app in a cluster, as well as create
 * the required ConfigMap and Secret resources to
 * fully configure it.
 * @param clientFactory
 * @param auth
 * @param clusterID
 * @param appConfig
 */
export async function createApp(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clusterID: string,
  appConfig: IAppConfig
): Promise<applicationv1alpha1.IApp> {
  const clusterConfigMapName = getClusterConfigMapName(
    clusterID,
    appConfig.chartName
  );

  const kubeConfigSecretName = getKubeConfigSecretName(clusterID);

  const app: applicationv1alpha1.IApp = {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'App',
    metadata: {
      name: appConfig.name,
      namespace: clusterID,
      labels: {
        [applicationv1alpha1.labelAppOperator]: '1.0.0',
      },
    },
    spec: {
      name: appConfig.chartName,
      namespace: appConfig.namespace,
      version: appConfig.version,
      catalog: appConfig.catalogName,
      config: {
        configMap: {
          name: clusterConfigMapName,
          namespace: clusterID,
        },
      },
      kubeConfig: {
        context: {
          name: clusterID,
        },
        inCluster: false,
        secret: {
          name: kubeConfigSecretName,
          namespace: clusterID,
        },
      },
      userConfig: {},
    },
  };

  const userConfigMapName = getUserConfigMapName(appConfig.name);
  const userSecretName = getUserSecretName(appConfig.name);

  const [userConfigMap, userSecret] = await Promise.all([
    ensureAppUserConfigMap(
      clientFactory(),
      auth,
      clusterID,
      userConfigMapName,
      appConfig.configMapContents
    ),
    ensureAppUserSecret(
      clientFactory(),
      auth,
      clusterID,
      userSecretName,
      appConfig.secretContents
    ),
  ]);

  if (userConfigMap) {
    app.spec.userConfig!.configMap = {
      name: userConfigMap.metadata.name,
      namespace: userConfigMap.metadata.namespace!,
    };
  }

  if (userSecret) {
    app.spec.userConfig!.secret = {
      name: userSecret.metadata.name,
      namespace: userSecret.metadata.namespace!,
    };
  }

  return applicationv1alpha1.createApp(clientFactory(), auth, app);
}

/**
 * Filter a given collection of clusters by the given search query.
 * @param clusters
 * @param searchQuery
 */
export function filterClusters(
  clusters: capiv1alpha3.ICluster[],
  searchQuery: string
): capiv1alpha3.ICluster[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();
  if (normalizedQuery.length < 1 || clusters.length < 1) return clusters;

  return clusters.filter((cluster) => {
    switch (true) {
      case typeof cluster.metadata.deletionTimestamp === 'undefined':
      case cluster.metadata.name.includes(normalizedQuery):
      case capiv1alpha3
        .getClusterDescription(cluster)
        .toLowerCase()
        .includes(normalizedQuery):
      case capiv1alpha3
        .getClusterOrganization(cluster)
        ?.toLowerCase()
        .includes(normalizedQuery):
        return true;
      default:
        return false;
    }
  });
}

export async function ensureConfigMapForApp(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  appName: string,
  contents: string
) {
  const userConfigMapName = getUserConfigMapName(appName);
  const configMap = await ensureAppUserConfigMap(
    client,
    auth,
    namespace,
    userConfigMapName,
    contents
  );

  if (!configMap) return null;

  let app = await applicationv1alpha1.getApp(client, auth, namespace, appName);
  app.spec.userConfig = {
    ...app.spec.userConfig,
    configMap: {
      name: configMap.metadata.name,
      namespace: configMap.metadata.namespace!,
    },
  };

  app = await applicationv1alpha1.updateApp(client, auth, app);

  mutate(
    applicationv1alpha1.getAppKey(app.metadata.namespace!, app.metadata.name),
    app,
    false
  );

  mutate(
    applicationv1alpha1.getAppListKey({ namespace: app.metadata.namespace }),
    produce((draft?: applicationv1alpha1.IAppList) => {
      if (!draft) return;

      for (let i = 0; i < draft.items.length; i++) {
        if (draft.items[i].metadata.name === app.metadata.name) {
          draft.items[i] = app;
        }
      }
    }),
    false
  );

  return app;
}

export async function ensureSecretForApp(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  appName: string,
  contents: string
) {
  const userSecretName = getUserSecretName(appName);
  const secret = await ensureAppUserSecret(
    client,
    auth,
    namespace,
    userSecretName,
    contents
  );

  if (!secret) return null;

  let app = await applicationv1alpha1.getApp(client, auth, namespace, appName);
  app.spec.userConfig = {
    ...app.spec.userConfig,
    secret: {
      name: secret.metadata.name,
      namespace: secret.metadata.namespace!,
    },
  };

  app = await applicationv1alpha1.updateApp(client, auth, app);

  mutate(
    applicationv1alpha1.getAppKey(app.metadata.namespace!, app.metadata.name),
    app,
    false
  );

  mutate(
    applicationv1alpha1.getAppListKey({ namespace: app.metadata.namespace }),
    produce((draft?: applicationv1alpha1.IAppList) => {
      if (!draft) return;

      for (let i = 0; i < draft.items.length; i++) {
        if (draft.items[i].metadata.name === app.metadata.name) {
          draft.items[i] = app;
        }
      }
    }),
    false
  );

  return app;
}

export async function deleteConfigMapForApp(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  appName: string
) {
  const app = await applicationv1alpha1.getApp(
    client,
    auth,
    namespace,
    appName
  );
  app.spec.userConfig = {
    ...app.spec.userConfig,
    configMap: {
      name: '',
      namespace: '',
    },
  };

  await applicationv1alpha1.updateApp(client, auth, app);

  try {
    const userConfigMapName = getUserConfigMapName(appName);
    const configMap = await corev1.getConfigMap(
      client,
      auth,
      userConfigMapName,
      namespace
    );
    await corev1.deleteConfigMap(client, auth, configMap);
  } catch (err) {
    if (
      !metav1.isStatusError(
        (err as GenericResponse).data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      return Promise.reject(err);
    }
  }

  return app;
}

export async function deleteSecretForApp(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  appName: string
) {
  const app = await applicationv1alpha1.getApp(
    client,
    auth,
    namespace,
    appName
  );
  app.spec.userConfig = {
    ...app.spec.userConfig,
    secret: {
      name: '',
      namespace: '',
    },
  };

  await applicationv1alpha1.updateApp(client, auth, app);

  try {
    const userSecretName = getUserSecretName(appName);
    const secret = await corev1.getSecret(
      client,
      auth,
      userSecretName,
      namespace
    );
    await corev1.deleteSecret(client, auth, secret);
  } catch (err) {
    if (
      !metav1.isStatusError(
        (err as GenericResponse).data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      return Promise.reject(err);
    }
  }

  return app;
}

export async function deleteAppWithName(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  appName: string
) {
  try {
    const app = await applicationv1alpha1.getApp(
      client,
      auth,
      namespace,
      appName
    );
    await applicationv1alpha1.deleteApp(client, auth, app);

    app.metadata.deletionTimestamp = new Date().toISOString();

    mutate(
      applicationv1alpha1.getAppKey(app.metadata.namespace!, app.metadata.name),
      app,
      false
    );

    mutate(
      applicationv1alpha1.getAppListKey({
        namespace: app.metadata.namespace,
      }),
      produce((draft?: applicationv1alpha1.IAppList) => {
        if (!draft) return;

        for (let i = 0; i < draft.items.length; i++) {
          if (draft.items[i].metadata.name === app.metadata.name) {
            draft.items[i] = app;
          }
        }
      })
    );
  } catch (err) {
    if (
      !metav1.isStatusError(
        (err as GenericResponse).data,
        metav1.K8sStatusErrorReasons.NotFound
      )
    ) {
      return Promise.reject(err);
    }
  }

  return Promise.resolve();
}

export async function updateAppVersion(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  appName: string,
  version: string
) {
  let app = await applicationv1alpha1.getApp(client, auth, namespace, appName);
  app.spec.version = version;

  app = await applicationv1alpha1.updateApp(client, auth, app);

  mutate(
    applicationv1alpha1.getAppKey(app.metadata.namespace!, app.metadata.name),
    app,
    false
  );

  mutate(
    applicationv1alpha1.getAppListKey({ namespace: app.metadata.namespace }),
    produce((draft?: applicationv1alpha1.IAppList) => {
      if (!draft) return;

      for (let i = 0; i < draft.items.length; i++) {
        if (draft.items[i].metadata.name === app.metadata.name) {
          draft.items[i] = app;
        }
      }
    }),
    false
  );

  return app;
}

export function mapDefaultApps(release?: releasev1alpha1.IRelease) {
  const apps: Record<string, Record<string, AppConstants.IAppMetaApp>> = {
    essentials: {},
    management: {},
    ingress: {},
  };

  const releaseComponents = release
    ? releasesUtils.reduceReleaseToComponents(release)
    : {};

  for (const { name, version } of Object.values(releaseComponents)) {
    if (!AppConstants.appMetas.hasOwnProperty(name)) continue;

    let appMeta = AppConstants.appMetas[name];
    if (typeof appMeta === 'function') {
      appMeta = appMeta(version);
    }

    // Add the app to the list of apps we'll show in the interface, in the
    // correct category.
    apps[appMeta.category][appMeta.name] = {
      ...appMeta,
      version,
    };
  }

  for (const appMeta of Object.values(AppConstants.defaultAppMetas)) {
    // Make sure that the app is not already in the list
    if (apps[appMeta.category].hasOwnProperty(appMeta.name)) continue;

    apps[appMeta.category][appMeta.name] = appMeta;
  }

  return apps;
}

export function filterUserInstalledApps(
  apps: applicationv1alpha1.IApp[],
  supportsOptionalIngress: boolean
): applicationv1alpha1.IApp[] {
  return apps.filter((app) => {
    switch (true) {
      case supportsOptionalIngress &&
        app.spec.name === Constants.INSTALL_INGRESS_TAB_APP_NAME:
        return true;

      case app.metadata.labels?.[applicationv1alpha1.labelManagedBy] ===
        'cluster-operator':
        return false;

      default:
        return true;
    }
  });
}

export function findIngressApp(
  apps?: applicationv1alpha1.IApp[]
): applicationv1alpha1.IApp | null {
  const ingressApp = apps?.find((app) => {
    return app.spec.name === Constants.INSTALL_INGRESS_TAB_APP_NAME;
  });

  if (!ingressApp) return null;

  return ingressApp;
}

const ingressAppCatalogEntryListGetOptions = {
  labelSelector: {
    matchingLabels: {
      [applicationv1alpha1.labelAppName]:
        Constants.INSTALL_INGRESS_TAB_APP_NAME,
      [applicationv1alpha1.labelAppCatalog]:
        Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME,
      [applicationv1alpha1.labelLatest]: 'true',
    },
  },
};

export async function getIngressAppCatalogEntry(
  client: IHttpClient,
  auth: IOAuth2Provider
) {
  const appList = await applicationv1alpha1.getAppCatalogEntryList(
    client,
    auth,
    ingressAppCatalogEntryListGetOptions
  );
  if (appList.items.length < 1) return null;

  return appList.items[0];
}

export function getIngressAppCatalogEntryKey(
  existingApps?: applicationv1alpha1.IApp[]
) {
  const existingIngressApp = findIngressApp(existingApps);
  if (existingIngressApp) return null;

  return applicationv1alpha1.getAppCatalogEntryListKey(
    ingressAppCatalogEntryListGetOptions
  );
}

export function createIngressApp(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clusterID: string,
  ingressAppCatalogEntry: applicationv1alpha1.IAppCatalogEntry
) {
  return createApp(clientFactory, auth, clusterID, {
    name: ingressAppCatalogEntry.spec.appName,
    catalogName: ingressAppCatalogEntry.spec.catalog.name,
    chartName: ingressAppCatalogEntry.spec.appName,
    version: ingressAppCatalogEntry.spec.version,
    namespace: 'kube-system',
    configMapContents: '',
    secretContents: '',
  });
}

export function isTestRelease(releaseVersion: string): boolean {
  try {
    const version = new VersionImpl(releaseVersion);

    return version.getPreRelease().length > 0;
  } catch (err) {
    ErrorReporter.getInstance().notify(err as Error);

    return false;
  }
}

export function computeAppsCategorizedCounters(
  appCollection: applicationv1alpha1.IApp[]
): {
  apps: number;
  uniqueApps: number;
  deployed: number;
} {
  const apps: Record<string, boolean> = {};

  let totalAppCount = 0;
  let deployedAppCount = 0;

  for (const app of appCollection) {
    // Consider each catalog/app pair as unique.
    const key = `${app.spec.catalog}/${app.spec.name}`;
    apps[key] = true;

    if (app.status?.release.status?.toLowerCase() === 'deployed') {
      deployedAppCount++;
    }

    totalAppCount++;
  }

  return {
    apps: totalAppCount,
    uniqueApps: Object.values(apps).length,
    deployed: deployedAppCount,
  };
}

export function isAppChangingVersion(app: applicationv1alpha1.IApp): boolean {
  if (!app.status) return false;

  return (
    app.status.version.length > 0 && app.spec.version !== app.status.version
  );
}

export function getLatestVersionForApp(
  apps: applicationv1alpha1.IAppCatalogEntry[],
  appName: string
): string | undefined {
  const versions: string[] = [];
  for (const app of apps) {
    if (app.spec.appName === appName) {
      versions.push(app.spec.version);
    }
  }

  return versions.sort((a, b) => compare(b, a))[0];
}

export function isAppCatalogVisibleToUsers(
  appCatalog: applicationv1alpha1.IAppCatalog
) {
  return (
    applicationv1alpha1.isAppCatalogPublic(appCatalog) &&
    applicationv1alpha1.isAppCatalogStable(appCatalog)
  );
}

/**
 * Remove the `Giant Swarm` prefix from
 * internal catalogs, to ease cognitive load.
 * @param catalog
 */
export function computeAppCatalogUITitle(
  catalog: applicationv1alpha1.IAppCatalog
): string {
  const prefix = 'Giant Swarm ';

  if (
    !isAppCatalogVisibleToUsers(catalog) &&
    catalog.spec.title.startsWith(prefix)
  ) {
    return catalog.spec.title.slice(prefix.length);
  }

  return catalog.spec.title;
}
