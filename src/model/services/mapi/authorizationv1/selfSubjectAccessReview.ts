import { HttpRequestMethods, IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { ISelfSubjectAccessReview, ISelfSubjectAccessReviewSpec } from '.';

export function selfSubjectAccessReview(
  client: IHttpClient,
  user: ILoggedInUser,
  selfSubjectAccessReviewSpec: ISelfSubjectAccessReviewSpec
) {
  return async () => {
    const url = k8sUrl.create({
      baseUrl: window.config.mapiEndpoint,
      apiVersion: 'authorization.k8s.io/v1',
      kind: 'SelfSubjectAccessReviews',
    });

    const requestBody: ISelfSubjectAccessReview = {
      apiVersion: 'authorization.k8s.io/v1',
      kind: 'SelfSubjectAccessReview',
      spec: selfSubjectAccessReviewSpec,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client.setBody(requestBody as Record<string, any>);

    client.setURL(url.toString());
    client.setHeader('Accept', 'application/json');
    client.setRequestMethod(HttpRequestMethods.POST);
    client.setAuthorizationToken(user.auth.scheme, user.auth.token);

    const response = await client.execute<ISelfSubjectAccessReview>();

    return response.data;
  };
}
