import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { deleteResource } from '../generic/deleteResource';
import { ApiVersion, IG8sControlPlane } from './';

export function deleteG8sControlPlane(
  client: IHttpClient,
  auth: IOAuth2Provider,
  g8sControlPlane: IG8sControlPlane
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: ApiVersion,
    kind: 'g8scontrolplanes',
    namespace: g8sControlPlane.metadata.namespace,
    name: g8sControlPlane.metadata.name,
  } as k8sUrl.IK8sDeleteOptions);

  return deleteResource(client, auth, url.toString());
}
