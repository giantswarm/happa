import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { ICluster } from './';

export function createCluster(
  client: IHttpClient,
  auth: IOAuth2Provider,
  cluster: ICluster
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'clusters',
    namespace: cluster.metadata.namespace!,
    name: cluster.metadata.name,
  } as k8sUrl.IK8sCreateOptions);

  return createResource<ICluster>(client, auth, url.toString(), cluster);
}
