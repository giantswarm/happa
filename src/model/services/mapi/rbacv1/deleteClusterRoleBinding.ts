import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import { IClusterRoleBinding } from './types';

export async function deleteClusterRoleBinding(
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
    name: roleBinding.metadata.name,
    namespace: '',
  });

  client.setRequestConfig({
    url: url.toString(),
    method: HttpRequestMethods.DELETE,
    headers: {
      Accept: 'application/json',
    },
  });
  client.setAuthorizationToken(user.auth.scheme, user.auth.token);

  const response = await client.execute<IClusterRoleBinding>();

  return response.data;
}
