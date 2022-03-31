import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { IAzureMachine } from './';

export function createAzureMachine(
  client: IHttpClient,
  auth: IOAuth2Provider,
  azureMachine: IAzureMachine
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'azuremachines',
    namespace: azureMachine.metadata.namespace!,
    name: azureMachine.metadata.name,
  } as k8sUrl.IK8sCreateOptions);

  return createResource<IAzureMachine>(
    client,
    auth,
    url.toString(),
    azureMachine
  );
}
