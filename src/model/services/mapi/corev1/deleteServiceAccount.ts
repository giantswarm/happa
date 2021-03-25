import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import * as metav1 from 'model/services/mapi/metav1';
import { LoggedInUserTypes } from 'stores/main/types';

import { IServiceAccount } from './types';

export async function deleteServiceAccount(
  client: IHttpClient,
  user: ILoggedInUser,
  serviceAccount: IServiceAccount
) {
  if (!user || user.type !== LoggedInUserTypes.MAPI)
    return Promise.reject(new Error('Not logged in.'));

  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'serviceaccounts',
    name: serviceAccount.metadata.name,
    namespace: serviceAccount.metadata.namespace,
  });

  client.setRequestConfig({
    url: url.toString(),
    method: HttpRequestMethods.DELETE,
    headers: {
      Accept: 'application/json',
    },
  });
  client.setAuthorizationToken(user.auth.scheme, user.auth.token);

  const response = await client.execute<metav1.IK8sStatus>();

  return response.data;
}
