import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { IAzureCluster } from './';

export function createAzureCluster(
  client: IHttpClient,
  auth: IOAuth2Provider,
  azureCluster: IAzureCluster
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'azureclusters',
    namespace: azureCluster.metadata.namespace!,
    name: azureCluster.metadata.name,
  } as k8sUrl.IK8sCreateOptions);

  return createResource<IAzureCluster>(
    client,
    auth,
    url.toString(),
    azureCluster
  );
}
