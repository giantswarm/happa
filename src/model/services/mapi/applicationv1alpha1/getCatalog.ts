import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { ICatalog } from './types';

export function getCatalog(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'catalogs',
    namespace,
    name,
  });

  return getResource<ICatalog>(client, auth, url.toString());
}

export function getCatalogKey(namespace: string, name: string) {
  return `getCatalog/${namespace}/${name}`;
}
