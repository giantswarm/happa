import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IClusterRoleBinding } from './types';

export function getClusterRoleBinding(
  client: IHttpClient,
  auth: IOAuth2Provider,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'clusterrolebindings',
    name,
    namespace: '',
  });

  return getResource<IClusterRoleBinding>(client, auth, url.toString());
}

export function getClusterRoleBindingKey(name: string) {
  return `getClusterRoleBinding/${name}`;
}
