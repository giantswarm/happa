import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { createResource } from '../generic/createResource';
import { IServiceAccount } from './types';

export function createServiceAccount(
  client: IHttpClient,
  auth: IOAuth2Provider,
  serviceAccount: IServiceAccount
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'serviceaccounts',
    namespace: serviceAccount.metadata.namespace!,
  });

  return createResource<IServiceAccount>(
    client,
    auth,
    url.toString(),
    serviceAccount as unknown as Record<string, unknown>
  );
}
