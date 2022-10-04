import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { ApiVersion, IAWSControlPlaneList } from './';

export interface IGetAWSControlPlaneListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAWSControlPlaneList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAWSControlPlaneListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: ApiVersion,
    kind: 'awscontrolplanes',
    ...options,
  });

  return getListResource<IAWSControlPlaneList>(client, auth, url.toString());
}

export function getAWSControlPlaneListKey(
  options?: IGetAWSControlPlaneListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: ApiVersion,
    kind: 'awscontrolplanes',
    ...options,
  });

  return url.toString();
}
