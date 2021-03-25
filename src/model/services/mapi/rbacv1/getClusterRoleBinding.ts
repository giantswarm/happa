import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import { IClusterRoleBinding } from './types';

export function getClusterRoleBinding(
  client: IHttpClient,
  user: ILoggedInUser,
  name: string
) {
  return async () => {
    const url = k8sUrl.create({
      baseUrl: window.config.mapiEndpoint,
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'clusterrolebindings',
      name,
      namespace: '',
    });

    client.setRequestConfig({
      url: url.toString(),
      method: HttpRequestMethods.GET,
      headers: {
        Accept: 'application/json',
      },
    });
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    const response = await client.execute<IClusterRoleBinding>();

    return response.data;
  };
}

export function getClusterRoleBindingKey(
  user: ILoggedInUser | null,
  name: string
): string | null {
  if (!user || user.type !== LoggedInUserTypes.MAPI) return null;

  return `getClusterRoleBinding/${name}`;
}
