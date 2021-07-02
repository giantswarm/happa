import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { deleteResource } from '../generic/deleteResource';
import { ISecret } from './types';

export function deleteSecret(
  client: IHttpClient,
  auth: IOAuth2Provider,
  secret: ISecret
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'secrets',
    name: secret.metadata.name,
    namespace: secret.metadata.namespace!,
  });

  return deleteResource(client, auth, url.toString());
}
