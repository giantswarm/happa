import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { deleteResource } from '../generic/deleteResource';
import { ICluster } from './types';

export function deleteCluster(
  client: IHttpClient,
  auth: IOAuth2Provider,
  cluster: ICluster
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'cluster.x-k8s.io/v1alpha3',
    kind: 'clusters',
    namespace: cluster.metadata.namespace,
    name: cluster.metadata.name,
  } as k8sUrl.IK8sDeleteOptions);

  return deleteResource(client, auth, url.toString());
}
