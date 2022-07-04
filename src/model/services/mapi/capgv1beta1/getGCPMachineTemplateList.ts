import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IGCPMachineTemplateList } from './types';

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

  return getResource<IGCPMachineTemplateList>(client, auth, url.toString());
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
