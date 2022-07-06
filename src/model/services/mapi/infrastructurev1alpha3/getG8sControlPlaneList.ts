import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { IG8sControlPlaneList } from './';

export interface IGetG8sControlPlaneListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getG8sControlPlaneList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetG8sControlPlaneListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'g8scontrolplanes',
    ...options,
  });

  return getListResource<IG8sControlPlaneList>(client, auth, url.toString());
}

export function getG8sControlPlaneListKey(
  options?: IGetG8sControlPlaneListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'g8scontrolplanes',
    ...options,
  });

  return url.toString();
}
