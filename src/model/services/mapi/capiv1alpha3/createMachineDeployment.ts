import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { IMachineDeployment } from './';

export function createMachineDeployment(
  client: IHttpClient,
  auth: IOAuth2Provider,
  machineDeployment: IMachineDeployment
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'machinedeployments',
    namespace: machineDeployment.metadata.namespace!,
    name: machineDeployment.metadata.name,
  } as k8sUrl.IK8sCreateOptions);

  return createResource<IMachineDeployment>(
    client,
    auth,
    url.toString(),
    machineDeployment
  );
}
