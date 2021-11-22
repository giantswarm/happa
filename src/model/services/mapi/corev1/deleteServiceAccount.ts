import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { deleteResource } from '../generic/deleteResource';
import { IServiceAccount } from './types';

export function deleteServiceAccount(
  client: IHttpClient,
  auth: IOAuth2Provider,
  serviceAccount: IServiceAccount
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'serviceaccounts',
    name: serviceAccount.metadata.name,
    namespace: serviceAccount.metadata.namespace!,
  });

  return deleteResource(client, auth, url.toString());
}
