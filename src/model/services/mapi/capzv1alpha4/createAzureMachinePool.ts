import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { IAzureMachinePool } from '.';

export function createAzureMachinePool(
  client: IHttpClient,
  auth: IOAuth2Provider,
  azureMachinePool: IAzureMachinePool
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha4',
    kind: 'azuremachinepools',
    namespace: azureMachinePool.metadata.namespace!,
    name: azureMachinePool.metadata.name,
  } as k8sUrl.IK8sUpdateOptions);

  return createResource<IAzureMachinePool>(
    client,
    auth,
    url.toString(),
    azureMachinePool
  );
}
