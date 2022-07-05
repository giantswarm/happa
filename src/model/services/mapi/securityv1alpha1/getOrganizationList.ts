import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import { getListResource } from '../generic/getListResource';
import { IOrganizationList } from './types';

export function getOrganizationList(
  client: IHttpClient,
  auth: IOAuth2Provider
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'security.giantswarm.io/v1alpha1',
    kind: 'organizations',
  });

  return getListResource<IOrganizationList>(client, auth, url.toString());
}

export function getOrganizationListKey() {
  return 'getOrganizationList';
}
