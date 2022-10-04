import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { IAWSMachinePoolList } from './types';

export interface IGetAWSMachinePoolListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAWSMachinePoolList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAWSMachinePoolListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'awsmachinepools',
    ...options,
  });

  return getListResource<IAWSMachinePoolList>(client, auth, url.toString());
}

export function getAWSMachinePoolListKey(
  options?: IGetAWSMachinePoolListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'awsmachinepools',
    ...options,
  });

  return url.toString();
}
