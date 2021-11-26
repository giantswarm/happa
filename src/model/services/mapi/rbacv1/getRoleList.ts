import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IRoleList, Role } from './types';

export async function getRoleList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'roles',
    namespace,
    labelSelector: {
      matchingLabels: {
        'ui.giantswarm.io/display': 'true',
      },
    },
  });

  const list = await getResource<IRoleList>(client, auth, url.toString());
  for (const item of list.items) {
    item.kind = Role;
    item.apiVersion = 'rbac.authorization.k8s.io/v1';
  }

  return list;
}

export function getRoleListKey(namespace: string) {
  return `getRoleList/${namespace}`;
}
