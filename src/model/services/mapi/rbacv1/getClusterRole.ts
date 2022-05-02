import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IClusterRole } from './types';

export function getClusterRole(
  client: IHttpClient,
  auth: IOAuth2Provider,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'clusterroles',
    name,
    namespace: '',
  });

  return getResource<IClusterRole>(client, auth, url.toString());
}

export function getClusterRoleKey(name: string) {
  return `getClusterRole/${name}`;
}
