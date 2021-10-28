import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { updateResource } from '../generic/updateResource';
import { IG8sControlPlane } from './';

export function updateG8sControlPlane(
  client: IHttpClient,
  auth: IOAuth2Provider,
  g8sControlPlane: IG8sControlPlane
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'g8scontrolplanes',
    namespace: g8sControlPlane.metadata.namespace,
    name: g8sControlPlane.metadata.name,
  } as k8sUrl.IK8sUpdateOptions);

  return updateResource<IG8sControlPlane>(
    client,
    auth,
    url.toString(),
    g8sControlPlane
  );
}
