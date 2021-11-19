import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { deleteResource } from '../generic/deleteResource';
import { IMachineDeployment } from './types';

export function deleteMachineDeployment(
  client: IHttpClient,
  auth: IOAuth2Provider,
  machineDeployment: IMachineDeployment
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'machinedeployments',
    namespace: machineDeployment.metadata.namespace,
    name: machineDeployment.metadata.name,
  } as k8sUrl.IK8sDeleteOptions);

  return deleteResource(client, auth, url.toString());
}
