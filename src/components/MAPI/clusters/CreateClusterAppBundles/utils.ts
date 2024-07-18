import yaml from 'js-yaml';
import {
  ensureAppUserConfigMap,
  getClusterConfigMapName,
  templateConfigMap,
} from 'MAPI/apps/utils';
import { getNamespaceFromOrgName } from 'MAPI/utils';
import { IHttpClient } from 'model/clients/HttpClient';
import { Constants, Providers } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as corev1 from 'model/services/mapi/corev1';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';
import { compare } from 'utils/semver';

export async function fetchClusterAppACEList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  provider: PropertiesOf<typeof Providers>
): Promise<applicationv1alpha1.IAppCatalogEntryList> {
  const getOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions = {
    labelSelector: {
      matchingLabels: {
        [applicationv1alpha1.labelAppName]:
          applicationv1alpha1.getClusterAppNameForProvider(provider),
        [applicationv1alpha1.labelAppCatalog]:
          Constants.CLUSTER_APPS_CATALOG_NAME,
      },
    },
    namespace: Constants.CLUSTER_APPS_CATALOG_NAMESPACE,
  };

  return applicationv1alpha1.getAppCatalogEntryList(client, auth, getOptions);
}

export function fetchClusterAppACEListKey() {
  return `fetchClusterAppACEList`;
}

export async function fetchClusterDefaultAppsACEList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  provider: PropertiesOf<typeof Providers>
): Promise<applicationv1alpha1.IAppCatalogEntryList> {
  const getOptions: applicationv1alpha1.IGetAppCatalogEntryListOptions = {
    labelSelector: {
      matchingLabels: {
        [applicationv1alpha1.labelAppName]:
          applicationv1alpha1.getDefaultAppNameForProvider(provider),
        [applicationv1alpha1.labelAppCatalog]:
          Constants.CLUSTER_APPS_CATALOG_NAME,
      },
    },
    namespace: Constants.CLUSTER_APPS_CATALOG_NAMESPACE,
  };

  return applicationv1alpha1.getAppCatalogEntryList(client, auth, getOptions);
}

export function fetchClusterDefaultAppsACEListKey() {
  return `fetchClusterDefaultAppsACEList`;
}

function getClusterAppUserConfigMapName(appName: string) {
  return `${appName}-userconfig`;
}

function getDefaultAppsAppNameForCluster(clusterName: string) {
  return `${clusterName}-default-apps`;
}

function templateDefaultAppsConfigMapContents(
  clusterName: string,
  organization: string
): string {
  return yaml.dump({
    clusterName,
    organization: organization,
  });
}

export interface IClusterAppConfig {
  clusterName: string;
  organization: string;
  provider: PropertiesOf<typeof Providers>;
  clusterAppVersion: string;
  releaseVersion?: string;
  defaultAppsVersion: string;
  configMapContents: string;
}

function templateClusterAppCR(
  clusterName: string,
  orgNamespace: string,
  provider: PropertiesOf<typeof Providers>,
  appVersion: string,
  releaseVersion?: string,
  clusterAppUserConfigMap?: corev1.IConfigMap,
  appCatalog: string = Constants.CLUSTER_APPS_CATALOG_NAME
): applicationv1alpha1.IApp {
  return {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'App',
    metadata: {
      name: clusterName,
      namespace: orgNamespace,
      labels: {
        [applicationv1alpha1.labelAppOperator]: '0.0.0',
      },
    },
    spec: {
      name: applicationv1alpha1.getClusterAppNameForProvider(provider),
      namespace: orgNamespace,
      version: releaseVersion ? '' : appVersion,
      catalog: appCatalog,
      config: {
        configMap: {
          name: '',
          namespace: '',
        },
        secret: {
          name: '',
          namespace: '',
        },
      },
      kubeConfig: {
        context: {
          name: '',
        },
        inCluster: true,
        secret: {
          name: '',
          namespace: '',
        },
      },
      userConfig: {
        ...(clusterAppUserConfigMap && {
          configMap: {
            name: clusterAppUserConfigMap.metadata.name,
            namespace: clusterAppUserConfigMap.metadata.namespace!,
          },
        }),
      },
    },
  };
}

function templateDefaultAppsCR(
  clusterName: string,
  orgNamespace: string,
  provider: PropertiesOf<typeof Providers>,
  appVersion: string,
  defaultAppsConfigMap?: corev1.IConfigMap,
  appCatalog: string = Constants.CLUSTER_APPS_CATALOG_NAME
): applicationv1alpha1.IApp {
  return {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'App',
    metadata: {
      name: getDefaultAppsAppNameForCluster(clusterName),
      namespace: orgNamespace,
      labels: {
        [applicationv1alpha1.labelAppOperator]: '0.0.0',
        [applicationv1alpha1.labelCluster]: clusterName,
        [applicationv1alpha1.labelManagedBy]: 'cluster',
      },
    },
    spec: {
      name: applicationv1alpha1.getDefaultAppNameForProvider(provider),
      namespace: orgNamespace,
      version: appVersion,
      catalog: appCatalog,
      config: {
        configMap: {
          name: getClusterConfigMapName(clusterName),
          namespace: orgNamespace,
        },
        secret: {
          name: '',
          namespace: '',
        },
      },
      kubeConfig: {
        context: {
          name: '',
        },
        inCluster: true,
        secret: {
          name: '',
          namespace: '',
        },
      },
      userConfig: {
        ...(defaultAppsConfigMap && {
          configMap: {
            name: defaultAppsConfigMap.metadata.name,
            namespace: defaultAppsConfigMap.metadata.namespace!,
          },
        }),
      },
    },
  };
}

export function templateClusterAppConfigMapCR(
  clusterName: string,
  organization: string,
  contents: string
) {
  return templateConfigMap(
    getClusterAppUserConfigMapName(clusterName),
    getNamespaceFromOrgName(organization),
    contents,
    getClusterAppConfigMapLabels(clusterName)
  );
}

export function templateDefaultAppsConfigMapCR(
  clusterName: string,
  organization: string
) {
  return templateConfigMap(
    getClusterAppUserConfigMapName(
      getDefaultAppsAppNameForCluster(clusterName)
    ),
    getNamespaceFromOrgName(organization),
    templateDefaultAppsConfigMapContents(clusterName, organization),
    getClusterAppConfigMapLabels(clusterName)
  );
}

function getClusterAppConfigMapLabels(clusterName: string) {
  return {
    [applicationv1alpha1.labelCluster]: clusterName,
  };
}

export async function createClusterAppResources(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clusterAppConfig: IClusterAppConfig
): Promise<
  | [applicationv1alpha1.IApp]
  | [applicationv1alpha1.IApp, applicationv1alpha1.IApp]
> {
  const orgNamespace = getNamespaceFromOrgName(clusterAppConfig.organization);

  const configMapLabels = getClusterAppConfigMapLabels(
    clusterAppConfig.clusterName
  );

  const clusterAppUserConfigMap = await ensureAppUserConfigMap(
    clientFactory(),
    auth,
    orgNamespace,
    getClusterAppUserConfigMapName(clusterAppConfig.clusterName),
    clusterAppConfig.configMapContents,
    configMapLabels
  );

  const clusterAppCR = templateClusterAppCR(
    clusterAppConfig.clusterName,
    orgNamespace,
    clusterAppConfig.provider,
    clusterAppConfig.clusterAppVersion,
    clusterAppConfig.releaseVersion
  );

  if (clusterAppUserConfigMap) {
    clusterAppCR.spec.userConfig!.configMap = {
      name: clusterAppUserConfigMap.metadata.name,
      namespace: clusterAppUserConfigMap.metadata.namespace!,
    };
  }

  if (
    usesUnifiedClusterApp(
      clusterAppConfig.provider,
      clusterAppConfig.clusterAppVersion
    )
  ) {
    return Promise.all([
      applicationv1alpha1.createApp(clientFactory(), auth, clusterAppCR),
    ]);
  }

  const defaultAppsAppName = getDefaultAppsAppNameForCluster(
    clusterAppConfig.clusterName
  );

  const defaultAppsUserConfigMap = await ensureAppUserConfigMap(
    clientFactory(),
    auth,
    orgNamespace,
    getClusterAppUserConfigMapName(defaultAppsAppName),
    templateDefaultAppsConfigMapContents(
      clusterAppConfig.clusterName,
      clusterAppConfig.organization
    ),
    configMapLabels
  );

  const defaultAppsCR = templateDefaultAppsCR(
    clusterAppConfig.clusterName,
    orgNamespace,
    clusterAppConfig.provider,
    clusterAppConfig.defaultAppsVersion
  );

  if (defaultAppsUserConfigMap) {
    defaultAppsCR.spec.userConfig!.configMap = {
      name: defaultAppsUserConfigMap.metadata.name,
      namespace: defaultAppsUserConfigMap.metadata.namespace!,
    };
  }

  return Promise.all([
    applicationv1alpha1.createApp(clientFactory(), auth, clusterAppCR),
    applicationv1alpha1.createApp(clientFactory(), auth, defaultAppsCR),
  ]);
}

export function templateClusterCreationManifest(
  config: IClusterAppConfig
): string {
  const orgNamespace = getNamespaceFromOrgName(config.organization);

  const clusterAppUserConfigMap = templateClusterAppConfigMapCR(
    config.clusterName,
    config.organization,
    config.configMapContents
  );
  const defaultAppsUserConfigMap = templateDefaultAppsConfigMapCR(
    config.clusterName,
    config.organization
  );

  const resources = usesUnifiedClusterApp(
    config.provider,
    config.clusterAppVersion
  )
    ? [
        clusterAppUserConfigMap,
        templateClusterAppCR(
          config.clusterName,
          orgNamespace,
          config.provider,
          config.clusterAppVersion,
          config.releaseVersion,
          clusterAppUserConfigMap
        ),
      ]
    : [
        clusterAppUserConfigMap,
        defaultAppsUserConfigMap,
        templateClusterAppCR(
          config.clusterName,
          orgNamespace,
          config.provider,
          config.clusterAppVersion,
          config.releaseVersion,
          clusterAppUserConfigMap
        ),
        templateDefaultAppsCR(
          config.clusterName,
          orgNamespace,
          config.provider,
          config.defaultAppsVersion,
          defaultAppsUserConfigMap
        ),
      ];

  return `---\n${resources
    .map((r) =>
      yaml.dump(r, {
        indent: 2,
        quotingType: '"',
        lineWidth: -1,
      })
    )
    .join('---\n')}`;
}

export function usesUnifiedClusterApp(
  provider: string,
  clusterAppVersion: string
): boolean {
  switch (provider) {
    case Providers.CAPA:
      return (
        compare(
          clusterAppVersion,
          Constants.UNIFIED_CLUSTER_AWS_APP_MIN_VERSION
        ) >= 0
      );
    default:
      return false;
  }
}
