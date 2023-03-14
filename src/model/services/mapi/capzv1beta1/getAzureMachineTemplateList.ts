/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import { IHttpClient } from 'model/clients/HttpClient';
import { getListResource } from 'model/services/mapi/generic/getListResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IAzureMachineTemplateList } from '.';

export interface IGetAzureMachineTemplateListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAzureMachineTemplateList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAzureMachineTemplateListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'azuremachinetemplates',
    ...options,
  });

  return getListResource<IAzureMachineTemplateList>(
    client,
    auth,
    url.toString()
  );
}

export function getAzureMachineTemplateListKey(
  options?: IGetAzureMachineTemplateListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'azuremachinetemplates',
    ...options,
  });

  return url.toString();
}
