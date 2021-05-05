import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { ISecret } from './types';

export function getSecret(
  client: IHttpClient,
  auth: IOAuth2Provider,
  name: string,
  namespace: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'secrets',
    name,
    namespace,
  });

  return getResource<ISecret>(client, auth, url.toString());
}

export function getSecretKey(name: string, namespace: string) {
  return `getSecret/${namespace}/${name}`;
}
