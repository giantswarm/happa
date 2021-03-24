import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import { IRoleList } from './types';

export function getRoleList(
  client: IHttpClient,
  user: ILoggedInUser,
  namespace?: string
) {
  return async () => {
    const url = k8sUrl.create({
      baseUrl: window.config.mapiEndpoint,
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'roles',
      namespace: namespace!,
    });

    client.setRequestConfig({
      url: url.toString(),
      method: HttpRequestMethods.GET,
      headers: {
        Accept: 'application/json',
      },
    });
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    const response = await client.execute<IRoleList>();

    return response.data;
  };
}

export function getRoleListKey(
  user: ILoggedInUser | null,
  namespace?: string
): string | null {
  if (!user || user.type !== LoggedInUserTypes.MAPI) return null;

  return `getRoleList/${namespace}`;
}
