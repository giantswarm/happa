import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { getResource } from '../generic/getResource';
import { IRelease } from './types';

export function getRelease(
  client: IHttpClient,
  auth: IOAuth2Provider,
  name: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'release.giantswarm.io/v1alpha1',
    kind: 'releases',
    name,
  });

  return getResource<IRelease>(client, auth, url.toString());
}

export function getReleaseKey(name: string) {
  return `getRelease/${name}`;
}
