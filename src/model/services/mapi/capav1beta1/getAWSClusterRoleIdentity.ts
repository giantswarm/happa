import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IAWSClusterRoleIdentity } from '.';

export function getAWSClusterRoleIdentity(
  client: IHttpClient,
  auth: IOAuth2Provider,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
    kind: 'awsclusterroleidentities',
    name,
  });

  return getResource<IAWSClusterRoleIdentity>(client, auth, url.toString());
}

export function getAWSClusterRoleIdentityKey(name: string) {
  return `getAWSClusterRoleIdentity/${name}`;
}
