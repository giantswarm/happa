import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { IAppList } from './types';

export interface IGetAppListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAppList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAppListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'apps',
    ...options,
  });

  return getListResource<IAppList>(client, auth, url.toString());
}

export function getAppListKey(options?: IGetAppListOptions) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'application.giantswarm.io/v1alpha1',
    kind: 'apps',
    ...options,
  });

  return url.toString();
}
