import yaml from 'js-yaml';
import {
  ensureAppUserConfigMap,
  getClusterConfigMapName,
  templateConfigMap,
} from 'MAPI/apps/utils';
import { ControlPlaneNode, NodePoolList } from 'MAPI/types';
import { getNamespaceFromOrgName } from 'MAPI/utils';
import { IHttpClient } from 'model/clients/HttpClient';
import { Constants, Providers } from 'model/constants';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as corev1 from 'model/services/mapi/corev1';
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
  defaultAppsVersion: string;
  configMapContents: string;
}

function templateClusterAppCR(
  clusterName: string,
  orgNamespace: string,
  provider: PropertiesOf<typeof Providers>,
  appVersion: string,
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
): Promise<[applicationv1alpha1.IApp, applicationv1alpha1.IApp]> {
  const orgNamespace = getNamespaceFromOrgName(clusterAppConfig.organization);

  const defaultAppsAppName = getDefaultAppsAppNameForCluster(
    clusterAppConfig.clusterName
  );

  const configMapLabels = getClusterAppConfigMapLabels(
    clusterAppConfig.clusterName
  );

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
        templateDefaultAppsConfigMapContents(
          clusterAppConfig.clusterName,
          clusterAppConfig.organization
        ),
        configMapLabels
      ),
    ]
  );

  const clusterAppCR = templateClusterAppCR(
    clusterAppConfig.clusterName,
    orgNamespace,
    clusterAppConfig.provider,
    clusterAppConfig.clusterAppVersion
  );

  const defaultAppsCR = templateDefaultAppsCR(
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

  const resources = [
    clusterAppUserConfigMap,
    defaultAppsUserConfigMap,
    templateClusterAppCR(
      config.clusterName,
      orgNamespace,
      config.provider,
      config.clusterAppVersion,
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

export function formatClusterAppResourcesError(error: string) {
  return error
    .replace(/resource named (\S+)/, 'resource named <code>$1</code>')
    .replace(/in namespace (\S+)/, 'in namespace <code>$1</code>');
}

export function getControlPlaneNodesErrors(
  nodes: ControlPlaneNode[],
  provider: PropertiesOf<typeof Providers>
) {
  if (provider === Providers.CAPA) {
    const machines = nodes.filter(
      (node): node is capiv1beta1.IMachine => node.kind === capiv1beta1.Machine
    );

    return machines.flatMap((node) => {
      if (typeof node.status?.conditions === 'undefined') {
        return [];
      }

      return node.status.conditions
        .filter(
          (condition) =>
            condition.type === 'InfrastructureReady' &&
            condition.severity === 'Error'
        )
        .map((condition) => ({
          error: `${node.kind} resource named ${node.metadata.name} in namespace ${node.metadata.namespace}`,
          details: `${condition.reason}: ${condition.message}`,
        }));
    });
  }

  if (provider === Providers.CAPZ) {
    const machines = nodes.filter(
      (node): node is capiv1beta1.IMachine => node.kind === capiv1beta1.Machine
    );

    return machines
      .filter((node) => node.status?.phase === 'Failed')
      .map((node) => ({
        error: `${node.kind} resource named ${node.metadata.name} in namespace ${node.metadata.namespace}`,
        details: `${node.status?.failureReason}: ${node.status?.failureMessage}`,
      }));
  }

  return [];
}

export function getNodePoolsErrors(
  nodePoolList: NodePoolList,
  provider: PropertiesOf<typeof Providers>
) {
  if (provider === Providers.CAPA) {
    return nodePoolList.items.flatMap((nodePool) => {
      if (typeof nodePool.status?.conditions === 'undefined') {
        return [];
      }

      return nodePool.status.conditions
        .filter(
          (condition) =>
            condition.type === 'InfrastructureReady' &&
            condition.severity === 'Error'
        )
        .map((condition) => ({
          error: `${nodePool.kind} resource named ${nodePool.metadata.name} in namespace ${nodePool.metadata.namespace}`,
          details: `${condition.reason}: ${condition.message}`,
        }));
    });
  }

  return [];
}
