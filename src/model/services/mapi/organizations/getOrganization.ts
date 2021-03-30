import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { IOrganization } from './types';

export function getOrganization(
  client: IHttpClient,
  user: ILoggedInUser,
  name: string
) {
  return async () => {
    const url = k8sUrl.create({
      baseUrl: window.config.mapiEndpoint,
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'organizations',
      name: name,
    });

    client.setURL(url.toString());
    client.setHeader('Accept', 'application/json');
    client.setRequestMethod(HttpRequestMethods.GET);
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    const response = await client.execute<IOrganization>();

    return response.data;
  };
}
