/**
 * This file was automatically generated, PLEASE DO NOT MODIFY IT BY HAND.
 */

import { IHttpClient } from 'model/clients/HttpClient';
import { getResource } from 'model/services/mapi/generic/getResource';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { IGCPMachineTemplate } from '.';

export function getGCPMachineTemplate(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'gcpmachinetemplates',
    namespace,
    name,
  });

  return getResource<IGCPMachineTemplate>(client, auth, url.toString());
}

export function getGCPMachineTemplateKey(namespace: string, name: string) {
  return `getGCPMachineTemplate/${namespace}/${name}`;
}
