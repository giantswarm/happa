import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { updateResource } from '../generic/updateResource';
import { IApp } from './types';

export function updateApp(
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
  } as k8sUrl.IK8sUpdateOptions);

  return updateResource<IApp>(client, auth, url.toString(), app);
}
