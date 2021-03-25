import { IHttpClient } from 'model/clients/HttpClient';
import { LoggedInUserTypes } from 'stores/main/types';

import * as capzv1alpha3 from '../capzv1alpha3';
import { ICluster } from './';

export function getClusterInfraRef(
  client: IHttpClient,
  user: ILoggedInUser,
  cluster: ICluster
) {
  return async () => {
    const { infrastructureRef } = cluster.spec;
    if (!infrastructureRef) {
      return Promise.reject(
        new Error('There is no infrastructure reference defined.')
      );
    }

    switch (infrastructureRef.kind) {
      case capzv1alpha3.AzureCluster:
        return capzv1alpha3.getAzureClusterByName(
          client,
          user,
          cluster.metadata.namespace!,
          infrastructureRef.name
        )();

      default:
        return Promise.reject(new Error('Unsupported provider.'));
    }
  };
}

export function getClusterInfraRefKey(
  user: ILoggedInUser | null,
  cluster: ICluster
): string | null {
  if (!user || user.type !== LoggedInUserTypes.MAPI) return null;

  const { infrastructureRef } = cluster.spec;
  if (!infrastructureRef) return null;

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return capzv1alpha3.getAzureClusterByNameKey(
        user,
        cluster.metadata.namespace!,
        infrastructureRef.name
      );

    default:
      return null;
  }
}
