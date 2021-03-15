import * as capiv1alpha3 from './types/capiv1alpha3';

export function getClusterDescription(cluster: capiv1alpha3.ICluster): string {
  let name =
    cluster.metadata.annotations?.['cluster.giantswarm.io/description'];
  name ??= 'Unnamed cluster';

  return name;
}

export function getReleaseVersion(cluster: capiv1alpha3.ICluster): string {
  let release = cluster.metadata.labels?.['release.giantswarm.io/version'];
  release ??= '1.0.0';

  return release;
}
