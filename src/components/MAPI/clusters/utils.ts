import { IMachineType } from 'MAPI/utils';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import * as capiexpv1alpha3 from 'model/services/mapi/capiv1alpha3/exp';
import * as capzexpv1alpha3 from 'model/services/mapi/capzv1alpha3/exp';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';

export function getWorkerNodesCount(
  nodePools?: capiv1alpha3.IMachineDeployment[] | capiexpv1alpha3.IMachinePool[]
) {
  if (!nodePools) return undefined;

  let count = 0;
  for (const nodePool of nodePools) {
    if (typeof nodePool.status?.readyReplicas !== 'undefined') {
      count += nodePool.status.readyReplicas;
    }
  }

  return count;
}

export function getWorkerNodesCPU(
  nodePools?:
    | capiv1alpha3.IMachineDeployment[]
    | capiexpv1alpha3.IMachinePool[],
  providerNodePools?: capzexpv1alpha3.IAzureMachinePool[],
  machineTypes?: Record<string, IMachineType>
) {
  if (!nodePools || !providerNodePools || !machineTypes) return undefined;

  let count = 0;

  for (let i = 0; i < providerNodePools.length; i++) {
    const vmSize = providerNodePools[i].spec?.template.vmSize;
    const readyReplicas = nodePools[i].status?.readyReplicas;

    if (typeof vmSize !== 'undefined' && typeof readyReplicas !== 'undefined') {
      const machineTypeProperties = machineTypes[vmSize];
      if (!machineTypeProperties) {
        return -1;
      }

      count += machineTypeProperties.cpu * readyReplicas;
    }
  }

  return count;
}

export function getWorkerNodesMemory(
  nodePools?:
    | capiv1alpha3.IMachineDeployment[]
    | capiexpv1alpha3.IMachinePool[],
  providerNodePools?: capzexpv1alpha3.IAzureMachinePool[],
  machineTypes?: Record<string, IMachineType>
) {
  if (!nodePools || !providerNodePools || !machineTypes) return undefined;

  let count = 0;

  for (let i = 0; i < providerNodePools.length; i++) {
    const vmSize = providerNodePools[i].spec?.template.vmSize;
    const readyReplicas = nodePools[i].status?.readyReplicas;

    if (typeof vmSize !== 'undefined' && typeof readyReplicas !== 'undefined') {
      const machineTypeProperties = machineTypes[vmSize];
      if (!machineTypeProperties) {
        return -1;
      }

      count += machineTypeProperties.memory * readyReplicas;
    }
  }

  return count;
}

export function getK8sVersion(
  release?: releasev1alpha1.IRelease,
  releaseError?: unknown
): string | undefined {
  switch (true) {
    case Boolean(release):
      return releasev1alpha1.getK8sVersion(release!) ?? '';
    case Boolean(releaseError):
      return '';
    default:
      return undefined;
  }
}

export function formatReleaseVersion(
  cluster?: capiv1alpha3.ICluster
): string | undefined {
  const releaseVersion = cluster ? capiv1alpha3.getReleaseVersion(cluster) : '';

  switch (true) {
    case cluster?.metadata.deletionTimestamp !== undefined:
      return undefined;
    case Boolean(releaseVersion):
      return `v${releaseVersion}`;
    default:
      return undefined;
  }
}

export function compareClusters(
  a: capiv1alpha3.ICluster,
  b: capiv1alpha3.ICluster
) {
  // Move clusters that are currently deleting to the end of the list.
  const aIsDeleting = typeof a.metadata.deletionTimestamp !== 'undefined';
  const bIsDeleting = typeof b.metadata.deletionTimestamp !== 'undefined';

  if (aIsDeleting && !bIsDeleting) {
    return 1;
  } else if (!aIsDeleting && bIsDeleting) {
    return -1;
  }

  // Sort by description.
  const descriptionComparison = capiv1alpha3
    .getClusterDescription(a)
    .localeCompare(capiv1alpha3.getClusterDescription(b));
  if (descriptionComparison !== 0) {
    return descriptionComparison;
  }

  // If descriptions are the same, sort by resource name.
  return a.metadata.name.localeCompare(b.metadata.name);
}
