import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { ClusterRole, IClusterRoleList } from './types';

export interface IGetClusterRoleListOptions {
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

const defaultOptions: IGetClusterRoleListOptions = {
  labelSelector: {
    matchingLabels: {
      'ui.giantswarm.io/display': 'true',
    },
  },
};

export async function getClusterRoleList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetClusterRoleListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'clusterroles',
    ...(options ?? defaultOptions),
  });

  const list = await getListResource<IClusterRoleList>(
    client,
    auth,
    url.toString()
  );
  for (const item of list.items) {
    item.kind = ClusterRole;
    item.apiVersion = 'rbac.authorization.k8s.io/v1';
  }

  return list;
}

export function getClusterRoleListKey(options?: IGetClusterRoleListOptions) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'clusterroles',
    ...(options ?? defaultOptions),
  });

  return url.toString();
}
