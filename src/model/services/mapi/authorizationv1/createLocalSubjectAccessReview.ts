import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { ILocalSubjectAccessReview } from '.';
import { ILocalSubjectAccessReviewSpec } from './types';

export function createLocalSubjectAccessReview(
  client: IHttpClient,
  auth: IOAuth2Provider,
  localSubjectAccessReviewSpec: ILocalSubjectAccessReviewSpec
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'LocalSubjectAccessReviews',
    namespace: localSubjectAccessReviewSpec.resourceAttributes!.namespace,
  });

  const requestBody: ILocalSubjectAccessReview = {
    apiVersion: 'authorization.k8s.io/v1',
    kind: 'LocalSubjectAccessReview',
    metadata: {
      namespace: localSubjectAccessReviewSpec.resourceAttributes!.namespace,
      name: '',
    },
    spec: localSubjectAccessReviewSpec,
  };

  return createResource<ILocalSubjectAccessReview>(
    client,
    auth,
    url.toString(),
    requestBody
  );
}
