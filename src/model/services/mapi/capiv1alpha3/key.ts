import { ICluster } from './';

export const labelOrganization = 'giantswarm.io/organization';
export const labelCluster = 'giantswarm.io/cluster';
export const labelReleaseVersion = 'release.giantswarm.io/version';

export function getClusterDescription(cluster: ICluster): string {
  let name =
    cluster.metadata.annotations?.['cluster.giantswarm.io/description'];
  name ??= 'Unnamed cluster';

  return name;
}

export function getReleaseVersion(cluster: ICluster): string | undefined {
  return cluster.metadata.labels?.[labelReleaseVersion];
}
