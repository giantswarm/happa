import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IAWSCluster } from './';

export function getAWSCluster(
  client: IHttpClient,
  auth: IOAuth2Provider,
  namespace: string,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
    kind: 'awsclusters',
    namespace,
    name,
  });

  return getResource<IAWSCluster>(client, auth, url.toString());
}

export function getAWSClusterKey(namespace: string, name: string) {
  return `getAWSClusterKey/${namespace}/${name}`;
}
