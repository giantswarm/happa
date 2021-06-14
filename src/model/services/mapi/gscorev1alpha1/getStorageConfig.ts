import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IStorageConfig } from './types';

export function getStorageConfig(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'core.giantswarm.io/v1alpha1',
    kind: 'storageconfigs',
    name,
    namespace,
  });

  return getResource<IStorageConfig>(client, auth, url.toString());
}

export function getStorageConfigKey(namespace: string, name: string) {
  return `getStorageConfig/${namespace}/${name}`;
}
