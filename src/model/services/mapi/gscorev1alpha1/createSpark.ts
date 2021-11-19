import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { ISpark } from './';

export function createSpark(
  client: IHttpClient,
  auth: IOAuth2Provider,
  spark: ISpark
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'core.giantswarm.io/v1alpha1',
    kind: 'sparks',
    namespace: spark.metadata.namespace!,
    name: spark.metadata.name,
  } as k8sUrl.IK8sCreateOptions);

  return createResource<ISpark>(client, auth, url.toString(), spark);
}
