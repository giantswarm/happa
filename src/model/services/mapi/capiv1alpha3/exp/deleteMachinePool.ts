import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { deleteResource } from '../../generic/deleteResource';
import { IMachinePool } from './types';

export function deleteMachinePool(
  client: IHttpClient,
  auth: IOAuth2Provider,
  cluster: IMachinePool
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
    kind: 'machinepools',
    namespace: cluster.metadata.namespace,
    name: cluster.metadata.name,
  } as k8sUrl.IK8sDeleteOptions);

  return deleteResource(client, auth, url.toString());
}
