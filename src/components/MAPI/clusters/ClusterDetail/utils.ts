import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { ControlPlaneNode } from 'MAPI/types';
import { IHttpClient } from 'model/clients/HttpClient';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capzv1alpha3 from 'model/services/mapi/capzv1alpha3';
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
