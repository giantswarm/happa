import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IGCPCluster } from '.';

export function getGCPCluster(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'gcpclusters',
    namespace,
    name,
  });

  return getResource<IGCPCluster>(client, auth, url.toString());
}

export function getGCPClusterKey(namespace: string, name: string) {
  return `getGCPCluster/${namespace}/${name}`;
}
