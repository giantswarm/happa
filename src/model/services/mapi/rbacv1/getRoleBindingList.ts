import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IRoleBindingList, RoleBinding } from './types';

export async function getRoleBindingList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'rolebindings',
    namespace,
  });

  const list = await getResource<IRoleBindingList>(
    client,
    auth,
    url.toString()
  );
  for (const item of list.items) {
    item.kind = RoleBinding;
    item.apiVersion = 'rbac.authorization.k8s.io/v1';
  }

  return list;
}

export function getRoleBindingListKey(namespace: string) {
  return `getRoleBindingList/${namespace}`;
}
