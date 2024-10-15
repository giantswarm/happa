/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import { IHttpClient } from 'model/clients/HttpClient';
import { getResource } from 'model/services/mapi/generic/getResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IVSphereMachine } from '.';

export function getVSphereMachine(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'vspheremachines',
    namespace,
    name,
  });

  return getResource<IVSphereMachine>(client, auth, url.toString());
}

export function getVSphereMachineKey(namespace: string, name: string) {
  return `getVSphereMachine/${namespace}/${name}`;
}
