import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IRoleBinding } from './types';

export function getRoleBinding(
  client: IHttpClient,
  auth: IOAuth2Provider,
  name: string,
  namespace: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'rolebindings',
    name,
    namespace,
  });

  return getResource<IRoleBinding>(client, auth, url.toString());
}

export function getRoleRoleBindingKey(name: string, namespace: string) {
  return `getRoleBinding/${namespace}/${name}`;
}
