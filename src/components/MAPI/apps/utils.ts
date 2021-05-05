import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { GenericResponse } from 'model/clients/GenericResponse';
import { IHttpClient } from 'model/clients/HttpClient';
import * as applicationv1alpha1 from 'model/services/mapi/applicationv1alpha1';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as corev1 from 'model/services/mapi/corev1';
import * as metav1 from 'model/services/mapi/metav1';

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
  } catch (err: unknown) {
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
  } catch (err: unknown) {
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

export async function createApp(
  client: IHttpClient,
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
      name: appConfig.name,
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
      client,
      auth,
      clusterID,
      userConfigMapName,
      appConfig.configMapContents
    ),
    ensureAppUserSecret(
      client,
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

  return applicationv1alpha1.createApp(client, auth, app);
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
