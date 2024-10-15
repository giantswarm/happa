/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import { IHttpClient } from 'model/clients/HttpClient';
import { getListResource } from 'model/services/mapi/generic/getListResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IVSphereMachineTemplateList } from '.';

export interface IGetVSphereMachineTemplateListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getVSphereMachineTemplateList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetVSphereMachineTemplateListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'vspheremachinetemplates',
    ...options,
  });

  return getListResource<IVSphereMachineTemplateList>(
    client,
    auth,
    url.toString()
  );
}

export function getVSphereMachineTemplateListKey(
  options?: IGetVSphereMachineTemplateListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'vspheremachinetemplates',
    ...options,
  });

  return url.toString();
}
