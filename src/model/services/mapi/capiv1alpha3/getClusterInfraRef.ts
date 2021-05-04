import { IOAuth2Provider } from 'lib/OAuth2/OAuth2';
import { IHttpClient } from 'model/clients/HttpClient';

import * as capzv1alpha3 from '../capzv1alpha3';
import { ICluster } from './';

export function getClusterInfraRef(
  client: IHttpClient,
  auth: IOAuth2Provider,
  cluster: ICluster
) {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) {
    return Promise.reject(
      new Error('There is no infrastructure reference defined.')
    );
  }

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capzv1alpha3.getAzureCluster(
        client,
        auth,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    default:
      return Promise.reject(new Error('Unsupported provider.'));
  }
}

export function getClusterInfraRefKey(cluster: ICluster) {
  const infrastructureRef = cluster.spec?.infrastructureRef;
  if (!infrastructureRef) return null;

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capzv1alpha3.getAzureClusterKey(
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    default:
      return null;
  }
}
