import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { deleteResource } from '../generic/deleteResource';
import { ApiVersion, IAWSControlPlane } from './';

export function deleteAWSControlPlane(
  client: IHttpClient,
  auth: IOAuth2Provider,
  awsControlPlane: IAWSControlPlane
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: ApiVersion,
    kind: 'awscontrolplanes',
    namespace: awsControlPlane.metadata.namespace,
    name: awsControlPlane.metadata.name,
  } as k8sUrl.IK8sDeleteOptions);

  return deleteResource(client, auth, url.toString());
}
