import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { updateResource } from '../generic/updateResource';
import { IConfigMap } from './types';

export function updateConfigMap(
  client: IHttpClient,
  auth: IOAuth2Provider,
  configMap: IConfigMap
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'configmaps',
    name: configMap.metadata.name,
    namespace: configMap.metadata.namespace!,
  } as k8sUrl.IK8sUpdateOptions);

  return updateResource<IConfigMap>(client, auth, url.toString(), configMap);
}
