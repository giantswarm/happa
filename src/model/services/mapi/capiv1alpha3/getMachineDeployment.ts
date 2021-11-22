import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IMachineDeployment } from './';

export function getMachineDeployment(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'machinedeployments',
    namespace,
    name,
  });

  return getResource<IMachineDeployment>(client, auth, url.toString());
}

export function getMachineDeploymentKey(namespace: string, name: string) {
  return `getMachineDeploymentKey/${namespace}/${name}`;
}
