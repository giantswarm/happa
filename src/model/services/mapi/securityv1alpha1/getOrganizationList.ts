import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import { IOrganizationList } from './types';

export function getOrganizationList(client: IHttpClient, user: ILoggedInUser) {
  return async () => {
    const url = k8sUrl.create({
      baseUrl: window.config.mapiEndpoint,
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'organizations',
    });

    client.setURL(url.toString());
    client.setHeader('Accept', 'application/json');
    client.setRequestMethod(HttpRequestMethods.GET);
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    const response = await client.execute<IOrganizationList>();

    return response.data;
  };
}

export function getOrganizationListKey(
  user: ILoggedInUser | null
): string | null {
  if (!user || user.type !== LoggedInUserTypes.MAPI) return null;

  return 'getOrganizationList';
}
