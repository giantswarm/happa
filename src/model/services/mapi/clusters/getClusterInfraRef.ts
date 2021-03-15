import { IHttpClient } from 'model/clients/HttpClient';
import { LoggedInUserTypes } from 'stores/main/types';

import {
  getAzureClusterByName,
  getAzureClusterByNameKey,
} from './getAzureClusterByName';
import * as capiv1alpha3 from './types/capiv1alpha3';
import * as capzv1alpha3 from './types/capzv1alpha3';

export function getClusterInfraRef(
  client: IHttpClient,
  user: ILoggedInUser,
  cluster: capiv1alpha3.ICluster
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
        return getAzureClusterByName(
          client,
          user,
          cluster.metadata.namespace,
          infrastructureRef.name
        )();

      default:
        return Promise.reject(new Error('Unsupported provider.'));
    }
  };
}

export function getClusterInfraRefKey(
  user: ILoggedInUser | null,
  cluster: capiv1alpha3.ICluster
): string | null {
  if (!user || user.type !== LoggedInUserTypes.MAPI) return null;

  const { infrastructureRef } = cluster.spec;
  if (!infrastructureRef) return null;

  switch (infrastructureRef.kind) {
    case capzv1alpha3.AzureCluster:
      return getAzureClusterByNameKey(
        user,
        cluster.metadata.namespace,
        infrastructureRef.name
      );

    default:
      return null;
  }
}
