import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../../generic/getResource';
import { IMachinePool } from './types';

export function getMachinePool(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'exp.cluster.x-k8s.io/v1alpha3',
    kind: 'machinepools',
    namespace,
    name,
  });

  return getResource<IMachinePool>(client, auth, url.toString());
}

export function getMachinePoolKey(namespace: string, name: string) {
  return `getMachinePool/${namespace}/${name}`;
}
