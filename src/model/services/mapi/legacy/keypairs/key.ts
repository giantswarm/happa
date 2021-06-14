export const keypairStorageResourceName = 'cluster-service';
export const keypairStorageResourceNamespace = 'giantswarm';

export function createKeyPairStorageKey(
  clusterName: string,
  serialNumber: string
): string {
  return `/serial-store/cluster/${clusterName}/serial/${serialNumber}`;
}
