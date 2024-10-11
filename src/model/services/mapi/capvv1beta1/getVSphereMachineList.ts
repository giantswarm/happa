/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import { IHttpClient } from 'model/clients/HttpClient';
import { getListResource } from 'model/services/mapi/generic/getListResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IVSphereMachineList } from '.';

export interface IGetVSphereMachineListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getVSphereMachineList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetVSphereMachineListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'vspheremachines',
    ...options,
  });

  return getListResource<IVSphereMachineList>(client, auth, url.toString());
}

export function getVSphereMachineListKey(
  options?: IGetVSphereMachineListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'vspheremachines',
    ...options,
  });

  return url.toString();
}
