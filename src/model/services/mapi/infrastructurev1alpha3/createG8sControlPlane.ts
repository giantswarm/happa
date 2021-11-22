import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { IG8sControlPlane } from './';

export function createG8sControlPlane(
  client: IHttpClient,
  auth: IOAuth2Provider,
  g8sControlPlane: IG8sControlPlane
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'g8scontrolplanes',
    namespace: g8sControlPlane.metadata.namespace!,
    name: g8sControlPlane.metadata.name,
  } as k8sUrl.IK8sCreateOptions);

  return createResource<IG8sControlPlane>(
    client,
    auth,
    url.toString(),
    g8sControlPlane
  );
}
