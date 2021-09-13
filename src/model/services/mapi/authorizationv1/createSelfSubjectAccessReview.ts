import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { createResource } from '../generic/createResource';
import { ISelfSubjectAccessReview, ISelfSubjectAccessReviewSpec } from '.';

export function createSelfSubjectAccessReview(
  client: IHttpClient,
  auth: IOAuth2Provider,
  selfSubjectAccessReviewSpec: ISelfSubjectAccessReviewSpec
) {
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

  return createResource<ISelfSubjectAccessReview>(
    client,
    auth,
    url.toString(),
    requestBody as unknown as Record<string, unknown>
  );
}
