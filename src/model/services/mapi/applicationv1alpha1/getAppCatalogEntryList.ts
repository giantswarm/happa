import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { IAppCatalogEntryList } from './types';

export interface IGetAppCatalogEntryListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAppCatalogEntryList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAppCatalogEntryListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'appcatalogentries',
    ...options,
  });

  return getListResource<IAppCatalogEntryList>(client, auth, url.toString());
}

export function getAppCatalogEntryListKey(
  options?: IGetAppCatalogEntryListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'appcatalogentries',
    ...options,
  });

  return url.toString();
}
