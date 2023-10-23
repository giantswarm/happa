/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import { IHttpClient } from 'model/clients/HttpClient';
import { getListResource } from 'model/services/mapi/generic/getListResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IAWSManagedMachinePoolList } from '.';

export interface IGetAWSManagedMachinePoolListOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAWSManagedMachinePoolList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  options?: IGetAWSManagedMachinePoolListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2',
    kind: 'awsmanagedmachinepools',
    ...options,
  });

  return getListResource<IAWSManagedMachinePoolList>(
    client,
    auth,
    url.toString()
  );
}

export function getAWSManagedMachinePoolListKey(
  options?: IGetAWSManagedMachinePoolListOptions
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta2',
    kind: 'awsmanagedmachinepools',
    ...options,
  });

  return url.toString();
}
