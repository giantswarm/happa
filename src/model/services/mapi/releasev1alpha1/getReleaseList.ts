import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { IReleaseList } from './types';

export function getReleaseList(client: IHttpClient, auth: IOAuth2Provider) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'release.giantswarm.io/v1alpha1',
    kind: 'releases',
  });

  return getListResource<IReleaseList>(client, auth, url.toString());
}

export function getReleaseListKey() {
  return 'getReleaseList';
}
