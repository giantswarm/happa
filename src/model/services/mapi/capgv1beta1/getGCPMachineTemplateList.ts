/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import { IHttpClient } from 'model/clients/HttpClient';
import { getListResource } from 'model/services/mapi/generic/getListResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IGCPMachineTemplateList } from '.';

export interface IGetGCPMachineTemplateListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getGCPMachineTemplateList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetGCPMachineTemplateListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'gcpmachinetemplates',
    ...options,
  });

  return getListResource<IGCPMachineTemplateList>(client, auth, url.toString());
}

export function getGCPMachineTemplateListKey(
  options?: IGetGCPMachineTemplateListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'gcpmachinetemplates',
    ...options,
  });

  return url.toString();
}
