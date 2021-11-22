import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IConfigMap } from './types';

export function getConfigMap(
  client: IHttpClient,
  auth: IOAuth2Provider,
  name: string,
  namespace: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'configmaps',
    name,
    namespace,
  });

  return getResource<IConfigMap>(client, auth, url.toString());
}

export function getConfigMapKey(name: string, namespace: string) {
  return `getConfigMap/${namespace}/${name}`;
}
