import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import { IClusterRoleBinding } from './types';

export async function createClusterRoleBinding(
  client: IHttpClient,
  user: ILoggedInUser,
  roleBinding: IClusterRoleBinding
) {
  if (!user || user.type !== LoggedInUserTypes.MAPI)
    return Promise.reject(new Error('Not logged in.'));

  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'clusterrolebindings',
  });

  client.setURL(url.toString());
  client.setHeader('Accept', 'application/json');
  client.setRequestMethod(HttpRequestMethods.POST);
  client.setAuthorizationToken(user.auth.scheme, user.auth.token);
  client.setBody((roleBinding as unknown) as Record<string, unknown>);

  const response = await client.execute<IClusterRoleBinding>();

  return response.data;
}
