import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../../generic/getListResource';
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

  return getListResource<IMachinePoolList>(client, auth, url.toString());
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
