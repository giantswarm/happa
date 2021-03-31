import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import * as metav1 from 'model/services/mapi/metav1';
import { LoggedInUserTypes } from 'stores/main/types';

import { IOrganization } from './types';

export async function deleteOrganization(
  client: IHttpClient,
  user: ILoggedInUser,
  organization: IOrganization
) {
  if (!user || user.type !== LoggedInUserTypes.MAPI)
    return Promise.reject(new Error('Not logged in.'));

  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'security.giantswarm.io/v1alpha1',
    kind: 'organizations',
    name: organization.metadata.name,
    namespace: organization.metadata.namespace!,
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
