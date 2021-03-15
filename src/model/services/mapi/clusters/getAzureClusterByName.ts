import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { LoggedInUserTypes } from 'stores/main/types';

import * as capzv1alpha3 from './types/capzv1alpha3';

export function getAzureClusterByName(
  client: IHttpClient,
  user: ILoggedInUser,
  namespace: string,
  name: string
) {
  return async () => {
    const url = k8sUrl.create({
      baseUrl: window.config.mapiEndpoint,
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
      kind: 'azureclusters',
      namespace: namespace,
      name: name,
    });

    client.setURL(url.toString());
    client.setHeader('Accept', 'application/json');
    client.setRequestMethod(HttpRequestMethods.GET);
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    const response = await client.execute<capzv1alpha3.IAzureCluster>();

    return response.data;
  };
}

export function getAzureClusterByNameKey(
  user: ILoggedInUser | null,
  namespace: string,
  name: string
): string | null {
  if (!user || user.type !== LoggedInUserTypes.MAPI) return null;

  // TODO(axbarsan): This might be a good place to handle permissions.

  return `getAzureClusterByName/${namespace}/${name}`;
}
