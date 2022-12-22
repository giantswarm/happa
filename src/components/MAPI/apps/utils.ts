import { RJSFSchema } from '@rjsf/utils';
import produce from 'immer';
import { YAMLException } from 'js-yaml';
import { merge } from 'lodash';
import {
  getClusterOrganization,
  hasClusterAppLabel,
  IProviderClusterForCluster,
} from 'MAPI/clusters/utils';
import * as releasesUtils from 'MAPI/releases/utils';
import {
  getClusterBaseUrl,
  getClusterDescription,
  getClusterReleaseVersion,
  getNamespaceFromOrgName,
} from 'MAPI/utils';
import { GenericResponse } from 'model/clients/GenericResponse';
import { IHttpClient } from 'model/clients/HttpClient';
import { Constants, Providers } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import {
  getDefaultAppNameForProvider,
  IApp,
  isAppManagedByFlux,
} from 'model/services/mapi/applicationv1alpha1';
import * as authorizationv1 from 'model/services/mapi/authorizationv1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as corev1 from 'model/services/mapi/corev1';
import * as infrav1alpha2 from 'model/services/mapi/infrastructurev1alpha2';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as metav1 from 'model/services/mapi/metav1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import { Cache, mutate } from 'swr';
import ErrorReporter from 'utils/errors/ErrorReporter';
import {
  DeepPartial,
  isValidURL,
  traverseJSONSchemaObject,
} from 'utils/helpers';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import { compare } from 'utils/semver';
import { VersionImpl } from 'utils/Version';

function getUserConfigMapName(appName: string): string {
  return `${appName}-user-values`;
}

function getUserSecretName(appName: string): string {
  return `${appName}-user-secrets`;
}

function getClusterConfigMapName(
  clusterID: string,
  appName: string,
  isClusterApp: boolean
): string {
  if (appName === 'nginx-ingress-controller-app' && !isClusterApp) {
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
  appsNamespace: string,
  isClusterApp: boolean,
  appConfig: IAppConfig
): Promise<applicationv1alpha1.IApp> {
  const clusterConfigMapName = getClusterConfigMapName(
    clusterID,
    appConfig.chartName,
    isClusterApp
  );

  const kubeConfigSecretName = getKubeConfigSecretName(clusterID);

  const app: applicationv1alpha1.IApp = {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'App',
    metadata: {
      name: appConfig.name,
      namespace: appsNamespace,
      labels: {
        [applicationv1alpha1.labelAppOperator]: '1.0.0',
        [applicationv1alpha1.labelCluster]: clusterID,
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
          namespace: appsNamespace,
        },
      },
      kubeConfig: {
        context: {
          name: clusterID,
        },
        inCluster: false,
        secret: {
          name: kubeConfigSecretName,
          namespace: appsNamespace,
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
      appsNamespace,
      userConfigMapName,
      appConfig.configMapContents
    ),
    ensureAppUserSecret(
      clientFactory(),
      auth,
      appsNamespace,
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
 * @param clustersWithProviderClusters
 * @param searchQuery
 */
export function filterClusters(
  clustersWithProviderClusters: IProviderClusterForCluster[],
  organizations: Record<string, IOrganization>,
  previewReleaseVersions: string[],
  searchQuery: string
): IProviderClusterForCluster[] {
  if (clustersWithProviderClusters.length < 1)
    return clustersWithProviderClusters;

  const normalizedQuery = searchQuery.trim().toLowerCase();

  return clustersWithProviderClusters.filter((entry) => {
    const { cluster, providerCluster } = entry;

    const clusterOrganization = getClusterOrganization(cluster, organizations);

    switch (true) {
      case typeof cluster.metadata.deletionTimestamp !== 'undefined':
      case previewReleaseVersions.some(
        (version) => version === `v${getClusterReleaseVersion(cluster)}`
      ):
        // TODO: remove once preview releases are supported
        return false;
      case cluster.metadata.name.includes(normalizedQuery):
      case getClusterDescription(cluster, providerCluster)
        .toLowerCase()
        .includes(normalizedQuery):
      case clusterOrganization?.name?.includes(normalizedQuery):
      case clusterOrganization?.id?.includes(normalizedQuery):
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
  isClusterApp: boolean,
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

  const appPatch: DeepPartial<IApp> = {
    spec: {
      userConfig: {
        configMap: {
          name: configMap.metadata.name,
          namespace: configMap.metadata.namespace!,
        },
      },
    },
  };

  const app = await applicationv1alpha1.patchApp(
    client,
    auth,
    namespace,
    appName,
    appPatch
  );

  mutate(
    applicationv1alpha1.getAppKey(app.metadata.namespace!, app.metadata.name),
    app,
    false
  );

  const clusterID = app.metadata.labels?.[applicationv1alpha1.labelCluster];
  const appListGetOptions = isClusterApp
    ? {
        namespace: app.metadata.namespace,
        labelSelector: {
          matchingLabels: {
            [applicationv1alpha1.labelCluster]: clusterID!,
          },
        },
      }
    : { namespace: app.metadata.namespace };

  mutate(
    applicationv1alpha1.getAppListKey(appListGetOptions),
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
  isClusterApp: boolean,
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

  const appPatch: DeepPartial<IApp> = {
    spec: {
      userConfig: {
        secret: {
          name: secret.metadata.name,
          namespace: secret.metadata.namespace!,
        },
      },
    },
  };

  const app = await applicationv1alpha1.patchApp(
    client,
    auth,
    namespace,
    appName,
    appPatch
  );

  mutate(
    applicationv1alpha1.getAppKey(app.metadata.namespace!, app.metadata.name),
    app,
    false
  );

  const clusterID = app.metadata.labels?.[applicationv1alpha1.labelCluster];
  const appListGetOptions = isClusterApp
    ? {
        namespace: app.metadata.namespace,
        labelSelector: {
          matchingLabels: {
            [applicationv1alpha1.labelCluster]: clusterID!,
          },
        },
      }
    : { namespace: app.metadata.namespace };

  mutate(
    applicationv1alpha1.getAppListKey(appListGetOptions),
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

export async function deleteAppWithName(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  appName: string,
  isClusterApp: boolean
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

    const clusterID = app.metadata.labels?.[applicationv1alpha1.labelCluster];
    const appListGetOptions = isClusterApp
      ? {
          namespace: app.metadata.namespace,
          labelSelector: {
            matchingLabels: {
              [applicationv1alpha1.labelCluster]: clusterID!,
            },
          },
        }
      : { namespace: app.metadata.namespace };

    mutate(
      applicationv1alpha1.getAppListKey(appListGetOptions),
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
  version: string,
  isClusterApp: boolean
) {
  let app = await applicationv1alpha1.getApp(client, auth, namespace, appName);
  app.spec.version = version;

  app = await applicationv1alpha1.updateApp(client, auth, app);

  mutate(
    applicationv1alpha1.getAppKey(app.metadata.namespace!, app.metadata.name),
    app,
    false
  );

  const clusterID = app.metadata.labels?.[applicationv1alpha1.labelCluster];
  const appListGetOptions = isClusterApp
    ? {
        namespace: app.metadata.namespace,
        labelSelector: {
          matchingLabels: {
            [applicationv1alpha1.labelCluster]: clusterID!,
          },
        },
      }
    : { namespace: app.metadata.namespace };

  mutate(
    applicationv1alpha1.getAppListKey(appListGetOptions),
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

export function mapReleaseToApps(
  release: releasev1alpha1.IRelease,
  apps: IApp[]
) {
  const resultApps: IApp[] = [];

  const releaseComponents = releasesUtils.reduceReleaseToComponents(release);

  for (const { name } of Object.values(releaseComponents)) {
    const app = apps.find((item) => {
      return item.spec.name === name || item.metadata.name === name;
    });

    if (app) {
      resultApps.push(app);
    }
  }

  return resultApps;
}

export function isUserInstalledApp(
  app: IApp,
  isClusterApp: boolean,
  provider: PropertiesOf<typeof Providers>
) {
  const managedBy = app.metadata.labels?.[applicationv1alpha1.labelManagedBy];

  if (isClusterApp) {
    const defaultAppName = getDefaultAppNameForProvider(provider);
    const appName = app.metadata.labels?.[applicationv1alpha1.labelAppName];

    return managedBy !== 'cluster-apps-operator' && appName !== defaultAppName;
  }

  return managedBy !== 'cluster-operator';
}

export function filterUserInstalledApps(
  apps: applicationv1alpha1.IApp[],
  isClusterApp: boolean,
  provider: PropertiesOf<typeof Providers>
): applicationv1alpha1.IApp[] {
  return apps.filter((app) => {
    return isUserInstalledApp(app, isClusterApp, provider);
  });
}

export function filterDefaultApps(
  apps: applicationv1alpha1.IApp[],
  isClusterApp: boolean,
  provider: PropertiesOf<typeof Providers>
): applicationv1alpha1.IApp[] {
  return apps.filter((app) => {
    return !isUserInstalledApp(app, isClusterApp, provider);
  });
}

export function removeChildApps(apps: applicationv1alpha1.IApp[]) {
  const appNames = apps.map((app) => app.metadata.name);

  return apps.filter((app) => {
    const managedBy = app.metadata.labels?.[applicationv1alpha1.labelManagedBy];

    return (
      typeof managedBy === 'undefined' || appNames.indexOf(managedBy) === -1
    );
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
  namespace: Constants.INSTALL_INGRESS_TAB_CATALOG_NAMESPACE,
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
  appsNamespace: string,
  isClusterApp: boolean,
  ingressAppCatalogEntry: applicationv1alpha1.IAppCatalogEntry
) {
  return createApp(
    clientFactory,
    auth,
    clusterID,
    appsNamespace,
    isClusterApp,
    {
      name: ingressAppCatalogEntry.spec.appName,
      catalogName: ingressAppCatalogEntry.spec.catalog.name,
      chartName: ingressAppCatalogEntry.spec.appName,
      version: ingressAppCatalogEntry.spec.version,
      namespace: 'kube-system',
      configMapContents: '',
      secretContents: '',
    }
  );
}

export function getClusterK8sEndpoint(
  cluster: capiv1beta1.ICluster,
  provider: PropertiesOf<typeof Providers>
) {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return '';
  }

  const { kind, apiVersion } = infrastructureRef;
  let hostname = null;
  switch (true) {
    case kind === capzv1beta1.AzureCluster:
    case kind === infrav1alpha2.AWSCluster &&
      apiVersion === infrav1alpha2.ApiVersion:
    case kind === infrav1alpha3.AWSCluster &&
      apiVersion === infrav1alpha3.ApiVersion:
      hostname = cluster.spec?.controlPlaneEndpoint?.host;
      break;
    default:
      hostname = getClusterBaseUrl(cluster, provider).host;
  }

  return hostname ? `https://${hostname}` : '';
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
  notDeployed: number;
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
    notDeployed: totalAppCount - deployedAppCount,
  };
}

export function isAppChangingVersion(app: applicationv1alpha1.IApp): boolean {
  if (!app.status) return false;

  return (
    app.status.version.length > 0 &&
    (isAppManagedByFlux(app)
      ? normalizeAppVersion(app.spec.version) !== app.status.version
      : app.spec.version !== app.status.version)
  );
}

export function normalizeAppVersion(version: string): string {
  if (version.toLowerCase().startsWith('v')) {
    return version.substring(1);
  }

  return version;
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

  return versions.sort((a, b) =>
    compare(normalizeAppVersion(b), normalizeAppVersion(a))
  )[0];
}

export function hasNewerVersionForApp(
  appCatalogEntries: applicationv1alpha1.IAppCatalogEntry[],
  app: applicationv1alpha1.IApp
): boolean {
  const latestVersion = getLatestVersionForApp(
    appCatalogEntries,
    app.spec.name
  );
  if (!latestVersion) return false;

  return isAppManagedByFlux(app)
    ? latestVersion !== normalizeAppVersion(app.spec.version)
    : latestVersion !== app.spec.version;
}

export function isAppCatalogVisibleToUsers(
  appCatalog: applicationv1alpha1.ICatalog
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
  catalog: applicationv1alpha1.ICatalog
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

export function compareApps(
  a: applicationv1alpha1.IApp,
  b: applicationv1alpha1.IApp
) {
  // Move apps that are currently deleting to the end of the list.
  const aIsDeleting = typeof a.metadata.deletionTimestamp !== 'undefined';
  const bIsDeleting = typeof b.metadata.deletionTimestamp !== 'undefined';

  if (aIsDeleting && !bIsDeleting) {
    return 1;
  } else if (!aIsDeleting && bIsDeleting) {
    return -1;
  }

  return a.spec.name.localeCompare(b.spec.name);
}

export function formatYAMLError(err: unknown): string {
  if (err instanceof YAMLException) {
    return err.toString(true).replace(/^YAMLException/, 'YAML parse error');
  }

  return String(err);
}

/**
 * Determines whether an app has a newer version
 * @param clientFactory
 * @param auth
 * @param cache
 * @param app
 */
export async function hasNewerVersion(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cache: Cache,
  app: applicationv1alpha1.IApp,
  catalogList: applicationv1alpha1.ICatalogList
): Promise<{ name: string; hasNewerVersion: boolean }> {
  const catalogNamespace =
    app.spec.catalogNamespace ||
    catalogList?.items.find((c) => c.metadata.name === app.spec.catalog)
      ?.metadata.namespace;

  if (!catalogNamespace)
    return {
      name: app.spec.name,
      hasNewerVersion: false,
    };

  const appCatalogEntryListItems: applicationv1alpha1.IAppCatalogEntry[] = [];

  const appCatalogEntryListGetOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions =
    {
      labelSelector: {
        matchingLabels: {
          [applicationv1alpha1.labelAppName]: app.spec.name,
          [applicationv1alpha1.labelAppCatalog]: app.spec.catalog,
        },
      },
      namespace: catalogNamespace,
    };

  const appCatalogEntryListKey = applicationv1alpha1.getAppCatalogEntryListKey(
    appCatalogEntryListGetOptions
  );

  const cachedAppCatalogEntryList:
    | applicationv1alpha1.IAppCatalogEntryList
    | undefined = cache.get(appCatalogEntryListKey);

  if (cachedAppCatalogEntryList) {
    appCatalogEntryListItems.push(...cachedAppCatalogEntryList.items);
  } else {
    try {
      const appCatalogEntryList =
        await applicationv1alpha1.getAppCatalogEntryList(
          clientFactory(),
          auth,
          appCatalogEntryListGetOptions
        );

      appCatalogEntryListItems.push(...appCatalogEntryList.items);
      cache.set(appCatalogEntryListKey, appCatalogEntryList);
    } catch (err) {
      if (
        !metav1.isStatusError(
          (err as GenericResponse).data,
          metav1.K8sStatusErrorReasons.Forbidden
        )
      ) {
        return Promise.reject(err);
      }

      return {
        name: app.spec.name,
        hasNewerVersion: false,
      };
    }
  }

  return {
    name: app.spec.name,
    hasNewerVersion: hasNewerVersionForApp(appCatalogEntryListItems, app),
  };
}

/**
 * Get names of apps that can be upgraded (i.e. has newer versions)
 * by checking in the catalogs the user has access to.
 * @param clientFactory
 * @param auth
 * @param cache
 * @param apps
 * @param organization
 * @param isAdmin
 */
export async function getUpgradableApps(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cache: Cache,
  apps: applicationv1alpha1.IApp[],
  organizations: Record<string, IOrganization>,
  isAdmin: boolean
) {
  const catalogs = await fetchCatalogListForOrganizations(
    clientFactory,
    auth,
    cache,
    organizations,
    isAdmin
  );

  const response = await Promise.all(
    apps.map((app) =>
      hasNewerVersion(clientFactory, auth, cache, app, catalogs)
    )
  );

  const upgradableApps = [];

  for (const app of response) {
    if (app.hasNewerVersion) upgradableApps.push(app.name);
  }

  return upgradableApps;
}

/**
 * Key used for caching upgradable apps
 * @param apps
 */
export function getUpgradableAppsKey(apps: applicationv1alpha1.IApp[]) {
  if (apps.length === 0) return null;

  return `getUpgradableApps${apps.reduce(
    (key, app) => `${key}/${app.spec.catalog}/${app.spec.name}`,
    ''
  )}`;
}

export async function fetchCatalogListForOrganizations(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cache: Cache,
  organizations: Record<string, IOrganization>,
  isAdmin: boolean
): Promise<applicationv1alpha1.ICatalogList> {
  if (isAdmin) {
    // Admins can see any type of catalogs,
    // but only if they are not impersonating any users
    return applicationv1alpha1.getCatalogList(clientFactory(), auth);
  }

  const catalogListGetOptions: applicationv1alpha1.IGetCatalogListOptions = {
    labelSelector: {
      matchingLabels: {
        [applicationv1alpha1.labelCatalogVisibility]: 'public',
      },
    },
  };

  // Check if the user has access to list catalogs in all namespaces
  const request: authorizationv1.ISelfSubjectAccessReviewSpec = {
    resourceAttributes: {
      namespace: '',
      verb: 'list',
      group: 'application.giantswarm.io',
      resource: 'catalogs',
    },
  };

  const accessReviewResponse =
    await authorizationv1.createSelfSubjectAccessReview(
      clientFactory(),
      auth,
      request
    );

  if (accessReviewResponse.status?.allowed) {
    return applicationv1alpha1.getCatalogList(
      clientFactory(),
      auth,
      catalogListGetOptions
    );
  }

  // If not, we fetch catalogs in each organization namespace the user
  // belongs to, plus `default`
  const catalogList: applicationv1alpha1.ICatalogList = {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: applicationv1alpha1.CatalogList,
    metadata: {},
    items: [],
  };

  const namespaces = [
    'default',
    ...Object.entries(organizations).map(
      ([_, orgEntry]) =>
        orgEntry.namespace ?? getNamespaceFromOrgName(orgEntry.id)
    ),
  ];

  const requests = namespaces.map(async (namespace) => {
    catalogListGetOptions.namespace = namespace;

    const catalogListKey = applicationv1alpha1.getCatalogListKey(
      catalogListGetOptions
    );

    const cachedCatalogList: applicationv1alpha1.ICatalogList =
      cache.get(catalogListKey);

    if (cachedCatalogList) {
      return cachedCatalogList.items;
    }

    try {
      const catalogs = await applicationv1alpha1.getCatalogList(
        clientFactory(),
        auth,
        catalogListGetOptions
      );

      cache.set(catalogListKey, catalogs);

      return catalogs.items;
    } catch (err) {
      if (
        !metav1.isStatusError(
          (err as GenericResponse).data,
          metav1.K8sStatusErrorReasons.Forbidden
        )
      ) {
        return Promise.reject(err);
      }

      return [];
    }
  });

  const responses = await Promise.all(requests);

  for (const response of responses) {
    if (response.length > 0) {
      catalogList.items.push(...response);
    }
  }

  return catalogList;
}

export function fetchCatalogListForOrganizationsKey(
  organizations: Record<string, IOrganization>,
  isAdmin: boolean
): string {
  return `fetchCatalogListForOrgs/${Object.keys(organizations).join('/')}/${
    isAdmin ? 'isAdmin' : ''
  }`;
}

export async function fetchAppCatalogEntryListForOrganizations(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  cache: Cache,
  organizations: Record<string, IOrganization>,
  appCatalogEntryListGetOptions?: applicationv1alpha1.IGetAppCatalogEntryListOptions
): Promise<applicationv1alpha1.IAppCatalogEntryList> {
  // Check if the user has access to list appcatalogentries in all namespaces
  const request: authorizationv1.ISelfSubjectAccessReviewSpec = {
    resourceAttributes: {
      namespace: '',
      verb: 'list',
      group: 'application.giantswarm.io',
      resource: 'appcatalogentries',
    },
  };

  const accessReviewResponse =
    await authorizationv1.createSelfSubjectAccessReview(
      clientFactory(),
      auth,
      request
    );

  if (accessReviewResponse.status?.allowed) {
    return applicationv1alpha1.getAppCatalogEntryList(
      clientFactory(),
      auth,
      appCatalogEntryListGetOptions
    );
  }

  // If not, we fetch appcatalogentries in each organization
  // namespace the user belongs to, plus `default`
  const appCatalogEntryList: applicationv1alpha1.IAppCatalogEntryList = {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: applicationv1alpha1.AppCatalogEntryList,
    metadata: {},
    items: [],
  };

  const namespaces = Object.entries(organizations).map(
    ([_, orgEntry]) =>
      orgEntry.namespace ?? getNamespaceFromOrgName(orgEntry.id)
  );
  namespaces.push('default');

  const requests = namespaces.map(async (namespace) => {
    (appCatalogEntryListGetOptions ?? {}).namespace = namespace;

    const appCatalogEntryListKey =
      applicationv1alpha1.getAppCatalogEntryListKey(
        appCatalogEntryListGetOptions
      );

    const cachedAppCatalogEntryList: applicationv1alpha1.IAppCatalogEntryList =
      cache.get(appCatalogEntryListKey);

    if (cachedAppCatalogEntryList) {
      return cachedAppCatalogEntryList.items;
    }

    try {
      const appCatalogEntries =
        await applicationv1alpha1.getAppCatalogEntryList(
          clientFactory(),
          auth,
          appCatalogEntryListGetOptions
        );

      cache.set(appCatalogEntryListKey, appCatalogEntries);

      return appCatalogEntries.items;
    } catch (err) {
      if (
        !metav1.isStatusError(
          (err as GenericResponse).data,
          metav1.K8sStatusErrorReasons.Forbidden
        )
      ) {
        return Promise.reject(err);
      }

      return [];
    }
  });

  const responses = await Promise.all(requests);

  for (const response of responses) {
    if (response.length > 0) {
      appCatalogEntryList.items.push(...response);
    }
  }

  return appCatalogEntryList;
}

export function fetchAppCatalogEntryListForOrganizationsKey(
  organizations: Record<string, IOrganization>,
  appCatalogEntryGetOptions?: applicationv1alpha1.IGetAppCatalogEntryListOptions
): string {
  return `fetchAppCatalogEntryListForOrgs/${applicationv1alpha1.getAppCatalogEntryListKey(
    appCatalogEntryGetOptions
  )}/${Object.keys(organizations).join('/')}`;
}

export async function fetchAppsForClusters(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clusters: capiv1beta1.ICluster[]
): Promise<Record<string, { appName: string; catalogName: string }[]>> {
  const appsForClusters: Record<
    string,
    { appName: string; catalogName: string }[]
  > = {};

  const responses = await Promise.allSettled(
    clusters.map((cluster) => {
      const appListGetOptions = hasClusterAppLabel(cluster)
        ? {
            namespace: cluster.metadata.namespace,
            labelSelector: {
              matchingLabels: {
                [applicationv1alpha1.labelCluster]: cluster.metadata.name,
              },
            },
          }
        : { namespace: cluster.metadata.name };

      return applicationv1alpha1.getAppList(
        httpClientFactory(),
        auth,
        appListGetOptions
      );
    })
  );

  for (let i = 0; i < responses.length; i++) {
    const response = responses[i];
    const cluster = clusters[i];

    if (
      response.status === 'rejected' &&
      !metav1.isStatusError(
        (response.reason as GenericResponse).data,
        metav1.K8sStatusErrorReasons.Forbidden
      )
    ) {
      ErrorReporter.getInstance().notify(response.reason as Error);
    }

    if (response.status === 'fulfilled') {
      const appList = response.value;

      const clusterWithOrg = `${cluster.metadata.namespace}/${cluster.metadata.name}`;

      appsForClusters[clusterWithOrg] = appList.items.map((app) => {
        return { appName: app.spec.name, catalogName: app.spec.catalog };
      });
    }
  }

  return appsForClusters;
}

export function fetchAppsForClustersKey(
  clusters?: capiv1beta1.ICluster[]
): string | null {
  if (!clusters) return null;

  const clusterKeys = clusters.map(
    (c) => `${c.metadata.namespace}/${c.metadata.name}`
  );

  return `fetchAppsForClusters/${clusterKeys.join()}`;
}

/**
 * Retrieve the contents of an application's values.schema.json
 * from a given URL.
 * @param client
 * @param _auth
 * @param fromURL
 */
export async function fetchAppCatalogEntrySchema(
  client: IHttpClient,
  _auth: IOAuth2Provider,
  url: string
): Promise<RJSFSchema> {
  client.setRequestConfig({
    forceCORS: true,
    url,
    headers: {},
  });

  const response = await client.execute<RJSFSchema>();

  return resolveExternalSchemaRef(client, response.data);
}

export function fetchAppCatalogEntrySchemaKey(url?: string) {
  return url ?? null;
}

function hashURLToJSONRef(url: string): string {
  // URLs contain the '/' character, which has to be escaped
  // when used in JSON pointers
  return url.replaceAll('/', '~1');
}

/**
 * Collects all URL $refs from a schema and updates the external $ref
 * to point to internal $def
 * @param schema
 */
function parseSchemaForURLs(schema: RJSFSchema): [RJSFSchema, Set<string>] {
  const urls: Set<string> = new Set();

  const processURLs = (obj: RJSFSchema) => {
    const ref: string | undefined = obj.$ref;
    if (ref && isValidURL(ref)) {
      // collect URLs
      urls.add(ref);

      // update external $ref to point to definition in schema instead
      obj.$ref = `#/$defs/${hashURLToJSONRef(ref)}`;
    }

    return obj;
  };

  const patchedSchema = traverseJSONSchemaObject(schema, processURLs);

  return [patchedSchema, urls];
}

/**
 * Fetch schema from URL
 * @param client
 * @param url
 */
async function fetchExternalSchema(
  client: IHttpClient,
  url: string
): Promise<{ url: string; schemaData: RJSFSchema }> {
  client.setRequestConfig({
    forceCORS: true,
    url,
    headers: {},
  });

  const response = await client.execute<RJSFSchema>();

  return { url, schemaData: response.data };
}

/**
 * Patch an external schema by updating its internal references and $id,
 * so that it can be merged into the parent schema's $defs
 * @param url
 * @param schema
 */
function patchExternalSchema(url: string, schema: RJSFSchema): RJSFSchema {
  const processRefs = (obj: RJSFSchema) => {
    const ref: string | undefined = obj.$ref;
    if (ref && ref.startsWith('#/')) {
      // update relative $ref to point to correct $def
      obj.$ref = ref.replace('#/', `#/$defs/${hashURLToJSONRef(url)}/`);
    }

    return obj;
  };

  const patchedSchema = traverseJSONSchemaObject(schema, processRefs);

  // update $id so relative $refs within the subschema are handled correctly
  patchedSchema.$id = `/$defs/${hashURLToJSONRef(url)}`;

  return patchedSchema;
}

/**
 * Recursively fetch an external schema from URL, patch it, and parse it for external $refs with URLs
 * @param client
 * @param schema
 * @param urls
 * @param patchedDefs
 */
async function processExternalSchema(
  client: IHttpClient,
  urls: Set<string>,
  patchedDefs: Record<string, RJSFSchema>
): Promise<Record<string, RJSFSchema>> {
  try {
    if (urls.size === 0) {
      return patchedDefs;
    }

    const requests = Array.from(urls).map((url) =>
      fetchExternalSchema(client, url)
    );

    const responses = await Promise.allSettled(requests);

    for (const response of responses) {
      if (response.status === 'rejected') {
        throw response.reason;
      }

      if (response.status === 'fulfilled') {
        const { url, schemaData: fetchedSchema } = response.value;

        urls.delete(url);

        const patchedSchema = patchExternalSchema(url, fetchedSchema);

        patchedDefs[url] = patchedSchema;

        const [patchedSchemaForNewUrls, newUrls] =
          parseSchemaForURLs(patchedSchema);

        for (const newUrl of newUrls) {
          // if we haven't already processed the schema from a new URL,
          // add it to the list of URLs to fetch from
          if (!patchedDefs[newUrl]) {
            urls.add(newUrl);
          }

          // update stored schema
          patchedDefs[url] = patchedSchemaForNewUrls;
        }
      }
    }

    return processExternalSchema(client, urls, patchedDefs);
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 * Resolves external schema references with URLS of https/http protocol,
 * by fetching the schema from the referenced URLs and patching the parent schema's $defs
 * @param client
 * @param schema
 * @returns RJFSchema
 */
export async function resolveExternalSchemaRef(
  client: IHttpClient,
  schema: RJSFSchema
): Promise<RJSFSchema> {
  try {
    // parse parent schema for initial list of URLs
    const [patchedSchema, urls] = parseSchemaForURLs(schema);

    const patchedDefs = await processExternalSchema(client, urls, {});

    return merge(patchedSchema, { $defs: patchedDefs });
  } catch (e) {
    return Promise.reject(e);
  }
}
