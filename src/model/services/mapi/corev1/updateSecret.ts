import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { updateResource } from '../generic/updateResource';
import { ISecret } from './types';

export function updateSecret(
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
  } as k8sUrl.IK8sUpdateOptions);

  return updateResource<ISecret>(client, auth, url.toString(), secret);
}
