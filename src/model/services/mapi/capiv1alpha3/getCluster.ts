import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { ICluster } from './';

export function getCluster(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'clusters',
    namespace,
    name,
  });

  return getResource<ICluster>(client, auth, url.toString());
}

export function getClusterKey(namespace: string, name: string) {
  return `getClusterKey/${namespace}/${name}`;
}
