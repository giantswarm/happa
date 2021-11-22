import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { updateResource } from '../../generic/updateResource';
import { IMachinePool } from './';

export function updateMachinePool(
  client: IHttpClient,
  auth: IOAuth2Provider,
  machinePool: IMachinePool
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
    kind: 'machinepools',
    namespace: machinePool.metadata.namespace!,
    name: machinePool.metadata.name,
  } as k8sUrl.IK8sUpdateOptions);

  return updateResource<IMachinePool>(
    client,
    auth,
    url.toString(),
    machinePool
  );
}
