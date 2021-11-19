import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IClusterRoleList } from './types';

export function getClusterRoleList(client: IHttpClient, auth: IOAuth2Provider) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'clusterroles',
    labelSelector: {
      matchingLabels: {
        'ui.giantswarm.io/display': 'true',
      },
    },
  });

  return getResource<IClusterRoleList>(client, auth, url.toString());
}

export function getClusterRoleListKey() {
  return 'getClusterRoleList';
}
