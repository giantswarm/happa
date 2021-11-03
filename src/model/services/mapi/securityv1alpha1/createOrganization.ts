import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';
import * as k8sUrl from 'model/services/mapi/k8sUrl';

import { createResource } from '../generic/createResource';
import { IOrganization } from './types';

export function createOrganization(
  client: IHttpClient,
  auth: IOAuth2Provider,
  orgName: string
) {
  const url = k8sUrl.create({
    baseUrl: window.config.mapiEndpoint,
    apiVersion: 'security.giantswarm.io/v1alpha1',
    kind: 'organizations',
  });

  const organization: IOrganization = {
    apiVersion: 'security.giantswarm.io/v1alpha1',
    kind: 'Organization',
    spec: {},
    metadata: {
      name: orgName,
    },
  };

  return createResource<IOrganization>(
    client,
    auth,
    url.toString(),
    organization as unknown as Record<string, unknown>
  );
}
