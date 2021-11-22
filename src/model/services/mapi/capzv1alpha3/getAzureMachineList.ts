import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IAzureMachineList } from './';

export interface IGetAzureMachineListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAzureMachineList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAzureMachineListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: 'azuremachines',
    ...options,
  });

  return getResource<IAzureMachineList>(client, auth, url.toString());
}

export function getAzureMachineListKey(options?: IGetAzureMachineListOptions) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
    kind: 'azuremachines',
    ...options,
  });

  return url.toString();
}
