import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IClusterList } from './';

export interface IGetClusterListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getClusterList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetClusterListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1beta1',
    kind: 'clusters',
    ...options,
  });

  return getResource<IClusterList>(client, auth, url.toString());
}

export function getClusterListKey(options?: IGetClusterListOptions) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1beta1',
    kind: 'clusters',
    ...options,
  });

  return url.toString();
}
