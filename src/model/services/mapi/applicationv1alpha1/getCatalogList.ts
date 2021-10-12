import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { ICatalogList } from './types';

export interface IGetCatalogListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getCatalogList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetCatalogListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'catalogs',
    ...options,
  });

  return getResource<ICatalogList>(client, auth, url.toString());
}

export function getCatalogListKey(options?: IGetCatalogListOptions) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'catalogs',
    ...options,
  });

  return url.toString();
}
