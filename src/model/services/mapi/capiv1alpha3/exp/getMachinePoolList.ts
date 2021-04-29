import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../../generic/getResource';
import { IMachinePoolList } from './types';

export interface IGetMachinePoolListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getMachinePoolList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetMachinePoolListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
    kind: 'machinepools',
    ...options,
  });

  return getResource<IMachinePoolList>(client, auth, url.toString());
}

export function getMachinePoolListKey(options?: IGetMachinePoolListOptions) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
    kind: 'machinepools',
    ...options,
  });

  return url.toString();
}
