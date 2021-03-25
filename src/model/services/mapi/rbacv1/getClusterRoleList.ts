import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import { IClusterRoleList } from './types';

export function getClusterRoleList(client: IHttpClient, user: ILoggedInUser) {
  return async () => {
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

    client.setRequestConfig({
      url: url.toString(),
      method: HttpRequestMethods.GET,
      headers: {
        Accept: 'application/json',
      },
    });
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    const response = await client.execute<IClusterRoleList>();

    return response.data;
  };
}

export function getClusterRoleListKey(
  user: ILoggedInUser | null
): string | null {
  if (!user || user.type !== LoggedInUserTypes.MAPI) return null;

  return 'getClusterRoleList';
}
