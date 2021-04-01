import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { IClusterList } from './';

export async function getClusterList(
  client: IHttpClient,
  auth: IOAuth2Provider
) {
  const user = await auth.getLoggedInUser();
  if (!user) {
    return Promise.reject(new Error('You must be logged in.'));
    // eslint-disable-next-line no-magic-numbers
  } else if (Date.now() / 1000 > user.expiresAt) {
    return Promise.reject(
      new Error('Your token is invalid. Please log in again.')
    );
  }

  client.setAuthorizationToken(user.authorizationType, user.idToken);
  const response = await client.execute<IClusterList>();

  return response.data;
}

export function getClusterListKey(client: IHttpClient, auth: IOAuth2Provider) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'clusters',
  });

  client.setRequestConfig({
    url: url.toString(),
    method: HttpRequestMethods.GET,
    headers: {
      Accept: 'application/json',
    },
  });

  // TODO(axbarsan): This might be a good place to handle permissions.

  return [client, auth, url.toString()];
}
