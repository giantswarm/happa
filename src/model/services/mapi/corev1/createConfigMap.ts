import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { createResource } from '../generic/createResource';
import { IConfigMap } from './types';

export function createConfigMap(
  client: IHttpClient,
  auth: IOAuth2Provider,
  configMap: IConfigMap
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    isCore: true,
    kind: 'configmaps',
    namespace: configMap.metadata.namespace!,
  });

  return createResource<IConfigMap>(client, auth, url.toString(), configMap);
}
