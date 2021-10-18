import { Constants } from 'shared/constants';

import { IAWSCluster, IAWSMachineDeployment } from '.';

export const labelOrganization = 'giantswarm.io/organization';
export const labelCluster = 'giantswarm.io/cluster';
export const labelReleaseVersion = 'release.giantswarm.io/version';

export const conditionTypeCreated = 'Created';
export const conditionTypeCreating = 'Creating';
export const conditionTypeDeleted = 'Deleted';
export const conditionTypeDeleting = 'Deleting';
export const conditionTypeUpdated = 'Updated';
export const conditionTypeUpdating = 'Updating';

export function getAWSClusterDescription(awsCluster: IAWSCluster): string {
  let name = awsCluster.spec?.cluster?.description;
  name ??= Constants.DEFAULT_CLUSTER_DESCRIPTION;

  return name;
}

export function getAWSClusterOrganization(
  awsCluster: IAWSCluster
): string | undefined {
  return awsCluster.metadata.labels?.[labelOrganization];
}

export function getAWSClusterLabels(
  awsCluster: IAWSCluster
): Record<string, string> {
  if (!awsCluster.metadata.labels) return {};

  return awsCluster.metadata.labels;
}

export function getAWSMachineDeploymentDescription(
  awsMachineDeployment: IAWSMachineDeployment
): string {
  let name = awsMachineDeployment.spec.nodePool.description;
  name ??= Constants.DEFAULT_NODEPOOL_DESCRIPTION;

  return name;
}
