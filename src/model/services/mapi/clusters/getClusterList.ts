import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';

import { ICAPIV1Alpha3ClusterList } from './types';

export function getClusterList(client: IHttpClient, user: ILoggedInUser) {
  return async () => {
    client.setHeader('Accept', 'application/json');
    client.setRequestMethod(HttpRequestMethods.GET);
    client.setURL(
      `${window.config.mapiEndpoint}/apis/cluster.x-k8s.io/v1alpha3/clusters`
    );
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    const response = await client.execute<ICAPIV1Alpha3ClusterList>();

    return response.data;
  };
}

export function getClusterListKey(user: ILoggedInUser | null): string | null {
  if (!user) return null;

  // TODO(axbarsan): This might be a good place to handle permissions.

  return 'getClusterList';
}
