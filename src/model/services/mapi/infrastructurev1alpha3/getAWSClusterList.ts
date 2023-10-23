import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { AWSClusterListApiVersion, IAWSClusterList } from './';

export interface IGetAWSClusterListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAWSClusterList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAWSClusterListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: AWSClusterListApiVersion,
    kind: 'awsclusters',
    ...options,
  });

  return getListResource<IAWSClusterList>(client, auth, url.toString());
}

export function getAWSClusterListKey(options?: IGetAWSClusterListOptions) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: AWSClusterListApiVersion,
    kind: 'awsclusters',
    ...options,
  });

  return url.toString();
}
