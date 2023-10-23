import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { updateResource } from '../generic/updateResource';
import { AWSMachineDeploymentApiVersion, IAWSMachineDeployment } from './';

export function updateAWSMachineDeployment(
  client: IHttpClient,
  auth: IOAuth2Provider,
  awsMachineDeployment: IAWSMachineDeployment
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: AWSMachineDeploymentApiVersion,
    kind: 'awsmachinedeployments',
    namespace: awsMachineDeployment.metadata.namespace!,
    name: awsMachineDeployment.metadata.name,
  } as k8sUrl.IK8sUpdateOptions);

  return updateResource<IAWSMachineDeployment>(
    client,
    auth,
    url.toString(),
    awsMachineDeployment
  );
}
