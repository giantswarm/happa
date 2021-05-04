import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IMachineDeploymentList } from './';

export interface IGetMachineDeploymentListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getMachineDeploymentList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetMachineDeploymentListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'machinedeployments',
    ...options,
  });

  return getResource<IMachineDeploymentList>(client, auth, url.toString());
}

export function getMachineDeploymentListKey(
  options?: IGetMachineDeploymentListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'machinedeployments',
    ...options,
  });

  return url.toString();
}
