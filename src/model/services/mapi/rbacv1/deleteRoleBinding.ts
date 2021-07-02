import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { deleteResource } from '../generic/deleteResource';
import { IRoleBinding } from './types';

export function deleteRoleBinding(
  client: IHttpClient,
  auth: IOAuth2Provider,
  roleBinding: IRoleBinding
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'rolebindings',
    name: roleBinding.metadata.name,
    namespace: roleBinding.metadata.namespace!,
  });

  return deleteResource(client, auth, url.toString());
}
