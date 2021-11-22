import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { IApp } from './types';

export function createApp(
  client: IHttpClient,
  auth: IOAuth2Provider,
  app: IApp
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'apps',
    namespace: app.metadata.namespace!,
  });

  return createResource<IApp>(client, auth, url.toString(), app);
}
