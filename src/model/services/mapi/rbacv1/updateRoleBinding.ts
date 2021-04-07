import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { updateResource } from '../generic/updateResource';
import { IRoleBinding } from './types';

export function updateRoleBinding(
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
  } as k8sUrl.IK8sUpdateOptions);

  return updateResource<IRoleBinding>(
    client,
    auth,
    url.toString(),
    (roleBinding as unknown) as Record<string, unknown>
  );
}
