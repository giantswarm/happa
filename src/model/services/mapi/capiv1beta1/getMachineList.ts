import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IMachineList } from './types';

export interface IGetMachineListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getMachineList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetMachineListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1beta1',
    kind: 'machines',
    ...options,
  });

  return getResource<IMachineList>(client, auth, url.toString());
}

export function getMachineListKey(options?: IGetMachineListOptions) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1beta1',
    kind: 'machines',
    ...options,
  });

  return url.toString();
}
