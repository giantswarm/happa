import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IAWSControlPlaneList } from './';

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
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'awscontrolplanes',
    ...options,
  });

  return getResource<IAWSControlPlaneList>(client, auth, url.toString());
}

export function getAWSControlPlaneListKey(
  options?: IGetAWSControlPlaneListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'awscontrolplanes',
    ...options,
  });

  return url.toString();
}
