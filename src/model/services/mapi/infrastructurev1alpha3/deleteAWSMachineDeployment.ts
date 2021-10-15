import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { deleteResource } from '../generic/deleteResource';
import { IAWSMachineDeployment } from './types';

export function deleteAWSMachineDeployment(
  client: IHttpClient,
  auth: IOAuth2Provider,
  awsMachineDeployment: IAWSMachineDeployment
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'awsmachinedeployments',
    namespace: awsMachineDeployment.metadata.namespace,
    name: awsMachineDeployment.metadata.name,
  } as k8sUrl.IK8sDeleteOptions);

  return deleteResource(client, auth, url.toString());
}
