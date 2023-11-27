/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import { IHttpClient } from 'model/clients/HttpClient';
import { getListResource } from 'model/services/mapi/generic/getListResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IAWSManagedControlPlaneList } from '.';

export interface IGetAWSManagedControlPlaneListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAWSManagedControlPlaneList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAWSManagedControlPlaneListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'controlplane.cluster.x-k8s.io/v1beta2',
    kind: 'awsmanagedcontrolplanes',
    ...options,
  });

  return getListResource<IAWSManagedControlPlaneList>(
    client,
    auth,
    url.toString()
  );
}

export function getAWSManagedControlPlaneListKey(
  options?: IGetAWSManagedControlPlaneListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'controlplane.cluster.x-k8s.io/v1beta2',
    kind: 'awsmanagedcontrolplanes',
    ...options,
  });

  return url.toString();
}
