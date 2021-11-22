import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IAWSMachineDeployment } from './';

export function getAWSMachineDeployment(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'awsmachinedeployments',
    namespace,
    name,
  });

  return getResource<IAWSMachineDeployment>(client, auth, url.toString());
}

export function getAWSMachineDeploymentKey(namespace: string, name: string) {
  return `getAWSMachineDeploymentKey/${namespace}/${name}`;
}
