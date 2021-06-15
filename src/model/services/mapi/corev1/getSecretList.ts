import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { ISecretList } from './';

export interface IGetSecretListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getSecretList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetSecretListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'secrets',
    ...options,
  });

  return getResource<ISecretList>(client, auth, url.toString());
}

export function getSecretListKey(options?: IGetSecretListOptions) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'secrets',
    ...options,
  });

  return url.toString();
}
