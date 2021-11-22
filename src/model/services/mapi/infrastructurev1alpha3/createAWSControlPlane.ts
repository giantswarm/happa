import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { IAWSControlPlane } from './';

export function createAWSControlPlane(
  client: IHttpClient,
  auth: IOAuth2Provider,
  awsControlPlane: IAWSControlPlane
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'awscontrolplanes',
    namespace: awsControlPlane.metadata.namespace!,
    name: awsControlPlane.metadata.name,
  } as k8sUrl.IK8sCreateOptions);

  return createResource<IAWSControlPlane>(
    client,
    auth,
    url.toString(),
    awsControlPlane
  );
}
