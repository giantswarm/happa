import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { IOrganization } from './types';

export function createOrganization(
  client: IHttpClient,
  user: ILoggedInUser,
  orgName: string
) {
  return async () => {
    const url = k8sUrl.create({
      baseUrl: window.config.mapiEndpoint,
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'organizations',
    });

    client.setURL(url.toString());
    client.setHeader('Accept', 'application/json');
    client.setRequestMethod(HttpRequestMethods.POST);
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    // TODO: @oponder: is this ok?
    //                 What should the type for organization be in  `client.setBody(organization as Record<string, any>);`
    const organization: IOrganization = {
      apiVersion: 'security.giantswarm.io/v1alpha1',
      kind: 'Organization',
      spec: {},
      metadata: {
        name: orgName,
        namespace: 'default',
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.setBody(organization as Record<string, any>);

    const response = await client.execute<IOrganization>();

    return response.data;
  };
}
