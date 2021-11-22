import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { ISecret } from './types';

export function createSecret(
  client: IHttpClient,
  auth: IOAuth2Provider,
  secret: ISecret
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'secrets',
    namespace: secret.metadata.namespace!,
  });

  return createResource<ISecret>(client, auth, url.toString(), secret);
}
