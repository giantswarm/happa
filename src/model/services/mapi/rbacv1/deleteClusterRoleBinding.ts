import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { deleteResource } from '../generic/deleteResource';
import { IClusterRoleBinding } from './types';

export function deleteClusterRoleBinding(
  client: IHttpClient,
  auth: IOAuth2Provider,
  roleBinding: IClusterRoleBinding
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'clusterrolebindings',
    name: roleBinding.metadata.name,
    namespace: '',
  });

  return deleteResource<IClusterRoleBinding>(client, auth, url.toString());
}
