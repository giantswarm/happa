import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { deleteResource } from '../generic/deleteResource';
import { IConfigMap } from './types';

export function deleteConfigMap(
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
  });

  return deleteResource(client, auth, url.toString());
}
