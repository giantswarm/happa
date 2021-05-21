import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IAppCatalogList } from './types';

export interface IGetAppCatalogListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAppCatalogList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAppCatalogListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'appcatalogs',
    ...options,
  });

  return getResource<IAppCatalogList>(client, auth, url.toString());
}

export function getAppCatalogListKey(options?: IGetAppCatalogListOptions) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'appcatalogs',
    ...options,
  });

  return url.toString();
}
