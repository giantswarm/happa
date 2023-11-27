/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import { IHttpClient } from 'model/clients/HttpClient';
import { getResource } from 'model/services/mapi/generic/getResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IAWSManagedControlPlane } from '.';

export function getAWSManagedControlPlane(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'controlplane.cluster.x-k8s.io/v1beta2',
    kind: 'awsmanagedcontrolplanes',
    namespace,
    name,
  });

  return getResource<IAWSManagedControlPlane>(client, auth, url.toString());
}

export function getAWSManagedControlPlaneKey(namespace: string, name: string) {
  return `getAWSManagedControlPlane/${namespace}/${name}`;
}
