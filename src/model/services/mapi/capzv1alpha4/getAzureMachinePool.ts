import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IAzureMachinePool } from '.';

export interface IGetAzureMachinePoolOptions {
  namespace?: string;
  labelSelector?: k8sUrl.IK8sLabelSelector;
}

export function getAzureMachinePool(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha4',
    kind: 'azuremachinepools',
    namespace,
    name,
  });

  return getResource<IAzureMachinePool>(client, auth, url.toString());
}

export function getAzureMachinePoolKey(namespace: string, name: string) {
  return `getAzureMachinePool/v1alpha4/${namespace}/${name}`;
}
