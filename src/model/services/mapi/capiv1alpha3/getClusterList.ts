import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IClusterList } from './';

export function getClusterList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string = ''
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'clusters',
    namespace,
  });

  return getResource<IClusterList>(client, auth, url.toString());
}

export function getClusterListKey(namespace: string = '') {
  // TODO(axbarsan): This might be a good place to handle permissions.

  return `getClusterList/${namespace}`;
}
