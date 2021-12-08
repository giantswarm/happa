import { IHttpClient } from 'model/clients/HttpClient';
import * as gscorev1alpha1 from 'model/services/mapi/gscorev1alpha1';
import { IOAuth2Provider } from 'utils/OAuth2/OAuth2';

import {
  createKeyPairStorageKey,
  keypairStorageResourceName,
  keypairStorageResourceNamespace,
} from './key';
import { IKeyPair, IKeyPairList } from './types';

export async function getKeyPairList(
  client: IHttpClient,
  auth: IOAuth2Provider,
  clusterName: string
): Promise<IKeyPairList> {
  const keyPairStorage = await gscorev1alpha1.getStorageConfig(
    client,
    auth,
    keypairStorageResourceNamespace,
    keypairStorageResourceName
  );

  return { items: findKeyPairsForCluster(clusterName, keyPairStorage) };
}

export function getKeyPairListKey(clusterName: string) {
  return `getKeyPairList/${clusterName}`;
}

function findKeyPairsForCluster(
  clusterName: string,
  storageConfig: gscorev1alpha1.IStorageConfig
): IKeyPair[] {
  if (typeof storageConfig.spec === 'undefined') return [];

  const storageKeyPrefix = createKeyPairStorageKey(clusterName, '');

  const keyPairs: IKeyPair[] = [];
  for (const [key, value] of Object.entries(storageConfig.spec.storage.data)) {
    if (key.startsWith(storageKeyPrefix)) {
      //eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      keyPairs.push(JSON.parse(value));
    }
  }

  return keyPairs;
}
