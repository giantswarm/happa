import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';

import * as capzv1alpha3 from '../capzv1alpha3';
import { getResource } from '../generic/getResource';
import { ICluster } from './';

export function getClusterInfraRef(
  client: IHttpClient,
  auth: IOAuth2Provider,
  url: string
) {
  return getResource<capzv1alpha3.IAzureCluster>(client, auth, url);
}

export function getClusterInfraRefKey(
  client: IHttpClient,
  auth: IOAuth2Provider,
  cluster: ICluster
) {
  const { infrastructureRef } = cluster.spec;
  if (!infrastructureRef) return null;

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capzv1alpha3.getAzureClusterKey(
        client,
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    default:
      return null;
  }
}
