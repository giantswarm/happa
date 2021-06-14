import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { ControlPlaneNode } from 'MAPI/types';
import { IHttpClient } from 'model/clients/HttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
import * as legacyCredentials from 'model/services/mapi/legacy/credentials';
import { filterLabels } from 'stores/cluster/utils';
import * as ui from 'UI/Display/MAPI/clusters/types';

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

export function mapControlPlaneNodeToUIControlPlaneNode(
  node: ControlPlaneNode
): ui.IControlPlaneNodeItem {
  switch (node.kind) {
    case capzv1alpha3.AzureMachine:
      return {
        isReady: capiv1alpha3.isConditionTrue(
          node,
          capiv1alpha3.conditionTypeReady
        ),
        availabilityZone: node.spec?.failureDomain ?? '',
      };

    default:
      return {
        isReady: false,
        availabilityZone: '',
      };
  }
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

export function getClusterRegionLabel(cluster?: capiv1alpha3.ICluster) {
  if (!cluster) return undefined;

  switch (cluster.spec?.infrastructureRef?.kind) {
    case capzv1alpha3.AzureCluster:
      return 'Azure region';

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      return 'AWS region';

    default:
      return '';
  }
}

export function getClusterAccountIDLabel(cluster?: capiv1alpha3.ICluster) {
  if (!cluster) return undefined;

  switch (cluster.spec?.infrastructureRef?.kind) {
    case capzv1alpha3.AzureCluster:
      return 'Subscription ID';

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      return 'Account ID';

    default:
      return '';
  }
}

export function getClusterAccountIDPath(cluster?: capiv1alpha3.ICluster) {
  if (!cluster) return undefined;

  switch (cluster.spec?.infrastructureRef?.kind) {
    case capzv1alpha3.AzureCluster:
      return 'https://portal.azure.com/';

    // TODO(axbarsan): Use CAPA type once available.
    case 'AWSCluster':
      return 'https://console.aws.amazon.com/';

    default:
      return '';
  }
}

export function getCredentialsAccountID(
  credentials?: legacyCredentials.ICredential[]
) {
  if (!credentials) return undefined;
  if (credentials.length < 1) return '';

  const mainCredential = credentials[0];
  switch (true) {
    case mainCredential.hasOwnProperty('azureSubscriptionID'):
      return mainCredential.azureSubscriptionID;
    case mainCredential.hasOwnProperty('awsOperatorRole'):
      return mainCredential.awsOperatorRole;
    default:
      return '';
  }
}
