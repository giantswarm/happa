import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { deleteResource } from '../generic/deleteResource';
import { IApp } from './types';

export function deleteApp(
  client: IHttpClient,
  auth: IOAuth2Provider,
  app: IApp
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'apps',
    name: app.metadata.name,
    namespace: app.metadata.namespace!,
  });

  return deleteResource(client, auth, url.toString());
}
