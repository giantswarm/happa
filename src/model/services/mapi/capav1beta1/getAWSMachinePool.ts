/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import { IHttpClient } from 'model/clients/HttpClient';
import { getResource } from 'model/services/mapi/generic/getResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IAWSMachinePool } from '.';

export function getAWSMachinePool(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'awsmachinepools',
    namespace,
    name,
  });

  return getResource<IAWSMachinePool>(client, auth, url.toString());
}

export function getAWSMachinePoolKey(namespace: string, name: string) {
  return `getAWSMachinePool/${namespace}/${name}`;
}
