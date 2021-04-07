import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IClusterRoleBindingList } from './types';

export function getClusterRoleBindingList(
  client: IHttpClient,
  auth: IOAuth2Provider
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'clusterrolebindings',
  });

  return getResource<IClusterRoleBindingList>(client, auth, url.toString());
}

export function getClusterRoleBindingListKey() {
  return 'getClusterRoleBindingList';
}
