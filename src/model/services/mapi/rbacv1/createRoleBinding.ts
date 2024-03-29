import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { IRoleBinding } from './types';

export function createRoleBinding(
  client: IHttpClient,
  auth: IOAuth2Provider,
  roleBinding: IRoleBinding
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'rbac.authorization.k8s.io/v1',
    kind: 'rolebindings',
    namespace: roleBinding.metadata.namespace!,
  });

  return createResource<IRoleBinding>(
    client,
    auth,
    url.toString(),
    roleBinding as unknown as Record<string, unknown>
  );
}
