import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { createResource } from '../generic/createResource';
import { ISelfSubjectRulesReview } from '.';

export function createSelfSubjectRulesReview(
  client: IHttpClient,
  auth: IOAuth2Provider
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'SelfSubjectRulesReviews',
  });

  const requestBody: ISelfSubjectRulesReview = {
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'SelfSubjectRulesReview',
    spec: {
      namespace: 'default',
    },
  };

  return createResource<ISelfSubjectRulesReview>(
    client,
    auth,
    url.toString(),
    (requestBody as unknown) as Record<string, unknown>
  );
}
