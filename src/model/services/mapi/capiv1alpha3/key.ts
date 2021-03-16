import { ICluster } from './';

export function getClusterDescription(cluster: ICluster): string {
  let name =
    cluster.metadata.annotations?.['cluster.giantswarm.io/description'];
  name ??= 'Unnamed cluster';

  return name;
}

export function getReleaseVersion(cluster: ICluster): string {
  let release = cluster.metadata.labels?.['release.giantswarm.io/version'];
  release ??= '1.0.0';

  return release;
}
