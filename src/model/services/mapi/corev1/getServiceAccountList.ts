import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IServiceAccountList } from './types';

export function getServiceAccountList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'serviceaccounts',
    namespace,
  });

  return getResource<IServiceAccountList>(client, auth, url.toString());
}

export function getServiceAccountListKey(namespace: string) {
  return `getServiceAccountList${namespace}`;
}
