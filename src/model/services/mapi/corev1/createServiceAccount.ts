import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import { IServiceAccount } from './types';

export async function createServiceAccount(
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
    namespace: serviceAccount.metadata.namespace,
  });

  client.setRequestConfig({
    url: url.toString(),
    method: HttpRequestMethods.POST,
    headers: {
      Accept: 'application/json',
    },
    data: (serviceAccount as unknown) as Record<string, unknown>,
  });
  client.setAuthorizationToken(user.auth.scheme, user.auth.token);

  const response = await client.execute<IServiceAccount>();

  return response.data;
}
