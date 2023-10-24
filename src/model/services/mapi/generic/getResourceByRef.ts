import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import * as corev1 from '../corev1';
import { getResource } from './getResource';

export function getResourceByRef<T>(
  client: IHttpClient,
  auth: IOAuth2Provider,
  ref: corev1.IObjectReference
) {
  const { apiVersion, kind, name, namespace } = ref;

  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion,
    kind: getResourcePluralName(kind),
    namespace,
    name,
  });

  return getResource<T>(client, auth, url.toString());
}

export function getResourceByRefKey(ref: corev1.IObjectReference) {
  const { apiVersion, kind, name, namespace } = ref;

  return `getResource/${apiVersion}/${kind}/${namespace}/${name}`;
}

function getResourcePluralName(name: string) {
  return `${name.toLocaleLowerCase()}s`;
}
