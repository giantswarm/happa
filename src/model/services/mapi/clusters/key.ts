import { ICAPIV1Alpha3Cluster } from './types';

export function getClusterName(cluster: ICAPIV1Alpha3Cluster): string {
  let name =
    cluster.metadata.annotations?.['cluster.giantswarm.io/description'];
  name ??= 'Unnamed cluster';

  return name;
}

export function getReleaseVersion(cluster: ICAPIV1Alpha3Cluster): string {
  let release = cluster.metadata.labels?.['release.giantswarm.io/version'];
  release ??= '1.0.0';

  return release;
}
