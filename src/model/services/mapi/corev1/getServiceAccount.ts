import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import { IServiceAccount } from './types';

export function getServiceAccount(
  client: IHttpClient,
  user: ILoggedInUser,
  name: string,
  namespace: string
) {
  return async () => {
    const url = k8sUrl.create({
      baseUrl: window.config.mapiEndpoint,
      isCore: true,
      kind: 'serviceaccounts',
      name,
      namespace,
    });

    client.setRequestConfig({
      url: url.toString(),
      method: HttpRequestMethods.GET,
      headers: {
        Accept: 'application/json',
      },
    });
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    const response = await client.execute<IServiceAccount>();

    return response.data;
  };
}

export function getServiceAccountKey(
  user: ILoggedInUser | null,
  name: string,
  namespace: string
): string | null {
  if (!user || user.type !== LoggedInUserTypes.MAPI) return null;

  return `getServiceAccount/${namespace}/${name}`;
}
