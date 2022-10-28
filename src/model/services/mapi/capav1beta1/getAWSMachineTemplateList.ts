import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { IAWSMachineTemplateList } from './types';

export interface IGetAWSMachineTemplateListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAWSMachineTemplateList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAWSMachineTemplateListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'awsmachinetemplates',
    ...options,
  });

  return getListResource<IAWSMachineTemplateList>(client, auth, url.toString());
}

export function getAWSMachineTemplateListKey(
  options?: IGetAWSMachineTemplateListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'awsmachinetemplates',
    ...options,
  });

  return url.toString();
}
