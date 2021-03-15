import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import * as capiv1alpha3 from './types/capiv1alpha3';

export function getClusterList(client: IHttpClient, user: ILoggedInUser) {
  return async () => {
    const url = k8sUrl.create({
      baseUrl: window.config.mapiEndpoint,
      apiVersion: 'cluster.x-k8s.io/v1alpha3',
      kind: 'clusters',
    });

    client.setURL(url.toString());
    client.setHeader('Accept', 'application/json');
    client.setRequestMethod(HttpRequestMethods.GET);
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    const response = await client.execute<capiv1alpha3.IClusterList>();

    return response.data;
  };
}

export function getClusterListKey(user: ILoggedInUser | null): string | null {
  if (!user || user.type !== LoggedInUserTypes.MAPI) return null;

  // TODO(axbarsan): This might be a good place to handle permissions.

  return 'getClusterList';
}
