import produce from 'immer';
import { HttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';
import {
  fetchCluster,
  fetchProviderClusterForCluster,
  getClusterDescription,
} from 'MAPI/utils';
import { IHttpClient } from 'model/clients/HttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { filterLabels } from 'stores/cluster/utils';
import { mutate } from 'swr';

export async function updateClusterDescription(
  httpClientFactory: HttpClientFactory,
  auth: IOAuth2Provider,
  provider: PropertiesOf<typeof Providers>,
  namespace: string,
  name: string,
  newDescription: string
) {
  const cluster = await fetchCluster(
    httpClientFactory,
    auth,
    provider,
    namespace,
    name
  );

  // eslint-disable-next-line @typescript-eslint/init-declarations
  let providerCluster: ProviderCluster;

  if (provider === Providers.AWS) {
    providerCluster = await fetchProviderClusterForCluster(
      httpClientFactory,
      auth,
      cluster
    );
  }

  const description = getClusterDescription(cluster, providerCluster);
  if (description === newDescription) {
    return cluster;
  }

  if (
    providerCluster &&
    providerCluster.apiVersion === 'infrastructure.giantswarm.io/v1alpha3' &&
    typeof providerCluster.spec !== 'undefined'
  ) {
    providerCluster.spec.cluster.description = newDescription;

    const updatedProviderCluster = await infrav1alpha3.updateAWSCluster(
      httpClientFactory(),
      auth,
      providerCluster
    );

    mutate(
      infrav1alpha3.getAWSClusterKey(
        cluster.metadata.namespace!,
        cluster.metadata.name
      ),
      updatedProviderCluster,
      false
    );
  }

  cluster.metadata.annotations ??= {};
  cluster.metadata.annotations[capiv1alpha3.annotationClusterDescription] =
    newDescription;

  return capiv1alpha3.updateCluster(httpClientFactory(), auth, cluster);
}

export async function deleteCluster(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  cluster: Cluster
) {
  if (cluster.kind === capiv1alpha3.Cluster) {
    const updatedCluster = await capiv1alpha3.getCluster(
      httpClient,
      auth,
      cluster.metadata.namespace!,
      cluster.metadata.name
    );

    await capiv1alpha3.deleteCluster(httpClient, auth, updatedCluster);

    updatedCluster.metadata.deletionTimestamp = new Date().toISOString();

    mutate(
      capiv1alpha3.getClusterKey(
        cluster.metadata.namespace!,
        cluster.metadata.name
      ),
      updatedCluster,
      false
    );

    mutate(
      capiv1alpha3.getClusterListKey({
        namespace: cluster.metadata.namespace!,
      }),
      produce((draft?: capiv1alpha3.IClusterList) => {
        if (!draft) return;

        for (let i = 0; i < draft.items.length; i++) {
          if (draft.items[i].metadata.name === updatedCluster.metadata.name) {
            draft.items[i] = updatedCluster;
          }
        }
      }),
      false
    );

    return updatedCluster;
  }

  return Promise.reject(new Error('Unsupported provider.'));
}

export function getVisibleLabels(cluster?: capiv1alpha3.ICluster) {
  if (!cluster) return undefined;

  const existingLabels = capiv1alpha3.getClusterLabels(cluster);

  return filterLabels(existingLabels);
}

export async function updateClusterLabels(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string,
  patch: ILabelChange
) {
  const cluster = await capiv1alpha3.getCluster(
    httpClient,
    auth,
    namespace,
    name
  );

  cluster.metadata.labels ??= {};

  if (patch.replaceLabelWithKey) {
    delete cluster.metadata.labels[patch.replaceLabelWithKey];
  }

  if (patch.value === null) {
    delete cluster.metadata.labels[patch.key];
  } else {
    cluster.metadata.labels[patch.key] = patch.value;
  }

  return capiv1alpha3.updateCluster(httpClient, auth, cluster);
}

export function getCredentialsAccountID(
  credentials?: legacyCredentials.ICredential[]
) {
  if (!credentials) return undefined;
  if (credentials.length < 1) return '';

  const mainCredential = credentials.find((credential, _, collection) => {
    // If only the default credential is present, display it.
    if (collection.length === 1) return true;

    // If there are custom credentials, display the first one.
    return credential.name !== legacyCredentials.defaultCredentialName;
  });
  if (!mainCredential) return '';

  switch (true) {
    case mainCredential.hasOwnProperty('azureSubscriptionID'):
      return mainCredential.azureSubscriptionID;
    case mainCredential.hasOwnProperty('awsOperatorRole'):
      return mainCredential.awsOperatorRole;
    default:
      return '';
  }
}

export interface IControlPlaneNodesStats {
  totalCount: number;
  readyCount: number;
  availabilityZones: string[];
}

export function computeControlPlaneNodesStats(
  nodes: ControlPlaneNode[]
): IControlPlaneNodesStats {
  const stats: IControlPlaneNodesStats = {
    totalCount: 0,
    readyCount: 0,
    availabilityZones: [],
  };

  for (const node of nodes) {
    switch (node.kind) {
      case capzv1alpha3.AzureMachine:
        stats.totalCount++;

        if (
          capiv1alpha3.isConditionTrue(node, capiv1alpha3.conditionTypeReady)
        ) {
          stats.readyCount++;
        }

        if (node.spec?.failureDomain) {
          stats.availabilityZones.push(node.spec.failureDomain);
        }

        break;

      case infrav1alpha3.AWSControlPlane:
        if (node.spec.availabilityZones) {
          stats.availabilityZones.push(...node.spec.availabilityZones);
        }

        break;

      case infrav1alpha3.G8sControlPlane:
        stats.totalCount = node.spec.replicas ?? 0;
        stats.readyCount = node.status?.readyReplicas ?? 0;

        break;
    }
  }

  return stats;
}

export async function updateClusterReleaseVersion(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string,
  newVersion: string
) {
  const cluster = await capiv1alpha3.getCluster(
    httpClient,
    auth,
    namespace,
    name
  );
  const releaseVersion = capiv1alpha3.getReleaseVersion(cluster);
  if (releaseVersion === newVersion) {
    return cluster;
  }

  cluster.metadata.labels ??= {};
  cluster.metadata.labels[capiv1alpha3.labelReleaseVersion] = newVersion;

  return capiv1alpha3.updateCluster(httpClient, auth, cluster);
}
