import yaml from 'js-yaml';
import {
  ensureAppUserConfigMap,
  getClusterConfigMapName,
} from 'MAPI/apps/utils';
import { getNamespaceFromOrgName } from 'MAPI/utils';
import { IHttpClient } from 'model/clients/HttpClient';
import { Constants, Providers } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import { HttpClientFactory } from 'utils/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

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
) {
  return {
    clusterName,
    organization: organization,
  };
}

export interface IClusterAppConfig {
  clusterName: string;
  organization: string;
  provider: PropertiesOf<typeof Providers>;
  clusterAppVersion: string;
  defaultAppsVersion: string;
  configMapContents: string;
}

function createClusterAppCR(
  clusterName: string,
  orgNamespace: string,
  provider: PropertiesOf<typeof Providers>,
  appVersion: string,
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
      version: appVersion,
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
      userConfig: {},
    },
  };
}

function createDefaultAppsCR(
  name: string,
  clusterName: string,
  orgNamespace: string,
  provider: PropertiesOf<typeof Providers>,
  appVersion: string,
  appCatalog: string = Constants.CLUSTER_APPS_CATALOG_NAME
): applicationv1alpha1.IApp {
  return {
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'App',
    metadata: {
      name,
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
      userConfig: {},
    },
  };
}

export async function createClusterAppResources(
  clientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  clusterAppConfig: IClusterAppConfig
): Promise<[applicationv1alpha1.IApp, applicationv1alpha1.IApp]> {
  const orgNamespace = getNamespaceFromOrgName(clusterAppConfig.organization);

  const defaultAppsAppName = getDefaultAppsAppNameForCluster(
    clusterAppConfig.clusterName
  );

  const configMapLabels = {
    [applicationv1alpha1.labelCluster]: clusterAppConfig.clusterName,
  };

  const [clusterAppUserConfigMap, defaultAppsUserConfigMap] = await Promise.all(
    [
      ensureAppUserConfigMap(
        clientFactory(),
        auth,
        orgNamespace,
        getClusterAppUserConfigMapName(clusterAppConfig.clusterName),
        clusterAppConfig.configMapContents,
        configMapLabels
      ),
      ensureAppUserConfigMap(
        clientFactory(),
        auth,
        orgNamespace,
        getClusterAppUserConfigMapName(defaultAppsAppName),
        yaml.dump(
          templateDefaultAppsConfigMapContents(
            clusterAppConfig.clusterName,
            clusterAppConfig.organization
          )
        ),
        configMapLabels
      ),
    ]
  );

  const clusterAppCR = createClusterAppCR(
    clusterAppConfig.clusterName,
    orgNamespace,
    clusterAppConfig.provider,
    clusterAppConfig.clusterAppVersion
  );

  const defaultAppsCR = createDefaultAppsCR(
    defaultAppsAppName,
    clusterAppConfig.clusterName,
    orgNamespace,
    clusterAppConfig.provider,
    clusterAppConfig.defaultAppsVersion
  );

  if (clusterAppUserConfigMap) {
    clusterAppCR.spec.userConfig!.configMap = {
      name: clusterAppUserConfigMap.metadata.name,
      namespace: clusterAppUserConfigMap.metadata.namespace!,
    };
  }

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
