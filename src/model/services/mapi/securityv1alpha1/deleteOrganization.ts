import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { deleteResource } from '../generic/deleteResource';
import { IOrganization } from './types';

export function deleteOrganization(
  client: IHttpClient,
  auth: IOAuth2Provider,
  organization: IOrganization
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'security.giantswarm.io/v1alpha1',
    kind: 'organizations',
    name: organization.metadata.name,
    namespace: organization.metadata.namespace!,
  });

  return deleteResource(client, auth, url.toString());
}
