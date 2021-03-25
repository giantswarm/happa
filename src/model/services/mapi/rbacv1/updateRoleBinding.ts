import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import { IRoleBinding } from './types';

export async function updateRoleBinding(
  client: IHttpClient,
  user: ILoggedInUser,
  roleBinding: IRoleBinding
) {
  if (!user || user.type !== LoggedInUserTypes.MAPI)
    return Promise.reject(new Error('Not logged in.'));

  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'rolebindings',
    name: roleBinding.metadata.name,
    namespace: roleBinding.metadata.namespace!,
  } as k8sUrl.IK8sUpdateOptions);

  client.setRequestConfig({
    url: url.toString(),
    method: HttpRequestMethods.PUT,
    headers: {
      Accept: 'application/json',
    },
    data: (roleBinding as unknown) as Record<string, unknown>,
  });
  client.setAuthorizationToken(user.auth.scheme, user.auth.token);

  const response = await client.execute<IRoleBinding>();

  return response.data;
}
