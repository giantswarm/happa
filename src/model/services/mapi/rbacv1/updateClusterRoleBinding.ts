import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { updateResource } from '../generic/updateResource';
import { IClusterRoleBinding } from './types';

export function updateClusterRoleBinding(
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
  } as k8sUrl.IK8sUpdateOptions);

  return updateResource<IClusterRoleBinding>(
    client,
    auth,
    url.toString(),
    roleBinding as unknown as Record<string, unknown>
  );
}
