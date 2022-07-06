import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { ClusterRoleBinding, IClusterRoleBindingList } from './types';

export async function getClusterRoleBindingList(
  client: IHttpClient,
  auth: IOAuth2Provider
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'clusterrolebindings',
  });

  const list = await getListResource<IClusterRoleBindingList>(
    client,
    auth,
    url.toString()
  );
  for (const item of list.items) {
    item.kind = ClusterRoleBinding;
    item.apiVersion = 'rbac.authorization.k8s.io/v1';
  }

  return list;
}

export function getClusterRoleBindingListKey() {
  return 'getClusterRoleBindingList';
}
