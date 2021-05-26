import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IAppCatalog } from './types';

export function getAppCatalog(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'appcatalogs',
    namespace,
    name,
  });

  return getResource<IAppCatalog>(client, auth, url.toString());
}

export function getAppCatalogKey(namespace: string, name: string) {
  return `getAppCatalog/${namespace}/${name}`;
}
