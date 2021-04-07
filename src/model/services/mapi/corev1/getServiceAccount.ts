import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IServiceAccount } from './types';

export function getServiceAccount(
  client: IHttpClient,
  auth: IOAuth2Provider,
  name: string,
  namespace: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'serviceaccounts',
    name,
    namespace,
  });

  return getResource<IServiceAccount>(client, auth, url.toString());
}

export function getServiceAccountKey(name: string, namespace: string) {
  return `getServiceAccount/${namespace}/${name}`;
}
