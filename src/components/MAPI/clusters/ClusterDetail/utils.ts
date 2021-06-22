import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { ControlPlaneNode } from 'MAPI/types';
import { IHttpClient } from 'model/clients/HttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { filterLabels } from 'stores/cluster/utils';

export async function updateClusterDescription(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string,
  newDescription: string
) {
  const cluster = await capiv1alpha3.getCluster(
    httpClient,
    auth,
    namespace,
    name
  );
  const description = capiv1alpha3.getClusterDescription(cluster);
  if (description === newDescription) {
    return cluster;
  }

  cluster.metadata.annotations ??= {};
  cluster.metadata.annotations[
    capiv1alpha3.annotationClusterDescription
  ] = newDescription;

  return capiv1alpha3.updateCluster(httpClient, auth, cluster);
}

export async function deleteCluster(
  httpClient: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const cluster = await capiv1alpha3.getCluster(
    httpClient,
    auth,
    namespace,
    name
  );

  return capiv1alpha3.deleteCluster(httpClient, auth, cluster);
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
    totalCount: nodes.length,
    readyCount: 0,
    availabilityZones: [],
  };

  for (const node of nodes) {
    if (capiv1alpha3.isConditionTrue(node, capiv1alpha3.conditionTypeReady)) {
      stats.readyCount++;
    }

    if (node.spec?.failureDomain) {
      stats.availabilityZones.push(node.spec.failureDomain);
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
