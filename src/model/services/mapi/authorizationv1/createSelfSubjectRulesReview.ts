import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { ISelfSubjectRulesReview } from '.';

export function createSelfSubjectRulesReview(
  client: IHttpClient,
  auth: IOAuth2Provider,
  rulesReview: ISelfSubjectRulesReview
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'SelfSubjectRulesReviews',
  });

  return createResource<ISelfSubjectRulesReview>(
    client,
    auth,
    url.toString(),
    rulesReview
  );
}
