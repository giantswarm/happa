import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IAzureCluster } from '.';

export function getAzureCluster(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: 'azureclusters',
    namespace,
    name,
  });

  return getResource<IAzureCluster>(client, auth, url.toString());
}

export function getAzureClusterKey(namespace: string, name: string) {
  return `getAzureCluster/${namespace}/${name}`;
}
