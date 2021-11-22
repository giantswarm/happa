import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getResource } from '../generic/getResource';
import { IOrganization } from './types';

export function getOrganization(
  client: IHttpClient,
  auth: IOAuth2Provider,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'security.giantswarm.io/v1alpha1',
    kind: 'organizations',
    name,
  });

  return getResource<IOrganization>(client, auth, url.toString());
}

export function getOrganizationKey(name: string) {
  return `getOrganization/${name}`;
}
