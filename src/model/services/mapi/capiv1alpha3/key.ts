import * as corev1 from 'model/services/mapi/corev1';

import { ICluster, IStatusCondition } from './';

export const labelOrganization = 'giantswarm.io/organization';
export const labelCluster = 'giantswarm.io/cluster';
export const labelReleaseVersion = 'release.giantswarm.io/version';

export const annotationClusterDescription = 'cluster.giantswarm.io/description';

export const conditionTypeCreating = 'Creating';
export const conditionTypeUpgrading = 'Upgrading';

export const conditionReasonCreationCompleted = 'CreationCompleted';
export const conditionReasonExistingObject = 'ExistingObject';
export const conditionReasonUpgradeCompleted = 'UpgradeCompleted';
export const conditionReasonUpgradeNotStarted = 'UpgradeNotStarted';
export const conditionReasonUpgradePending = 'UpgradePending';

export function getClusterDescription(cluster: ICluster): string {
  let name = cluster.metadata.annotations?.[annotationClusterDescription];
  name ??= 'Unnamed cluster';

  return name;
}

export function getReleaseVersion(cluster: ICluster): string | undefined {
  return cluster.metadata.labels?.[labelReleaseVersion];
}

export function getClusterOrganization(cluster: ICluster): string | undefined {
  return cluster.metadata.labels?.[labelOrganization];
}

export function getCondition(
  cluster: ICluster,
  type: string
): IStatusCondition | undefined {
  const conditions = cluster.status?.conditions;
  if (!conditions) return undefined;

  return conditions.find((c) => c.type === type);
}

export function hasCondition(cluster: ICluster, type: string): boolean {
  return typeof getCondition(cluster, type) !== 'undefined';
}

export function isConditionTrue(
  cluster: ICluster,
  type: string,
  ...checkOptions: CheckOption[]
): boolean {
  const condition = getCondition(cluster, type);
  if (!condition) return false;

  if (condition.status === corev1.conditionTrue) {
    return true;
  }

  for (const checkOption of checkOptions) {
    if (checkOption(condition)) return true;
  }

  return false;
}

export function isConditionFalse(
  cluster: ICluster,
  type: string,
  ...checkOptions: CheckOption[]
): boolean {
  const condition = getCondition(cluster, type);
  if (!condition) return false;

  if (condition.status === corev1.conditionFalse) {
    return true;
  }

  for (const checkOption of checkOptions) {
    if (!checkOption(condition)) return true;
  }

  return false;
}

export function isConditionUnknown(
  cluster: ICluster,
  type: string,
  ...checkOptions: CheckOption[]
): boolean {
  const condition = getCondition(cluster, type);
  if (!condition) return false;

  if (condition.status === corev1.conditionUnknown) {
    return true;
  }

  for (const checkOption of checkOptions) {
    if (checkOption(condition)) return true;
  }

  return false;
}

export type CheckOption = (condition: IStatusCondition) => boolean;

export function withReasonCreationCompleted(): CheckOption {
  return (condition: IStatusCondition) =>
    condition.reason === conditionReasonCreationCompleted;
}

export function withReasonExistingObject(): CheckOption {
  return (condition: IStatusCondition) =>
    condition.reason === conditionReasonExistingObject;
}

export function withReasonUpgradeCompleted(): CheckOption {
  return (condition: IStatusCondition) =>
    condition.reason === conditionReasonUpgradeCompleted;
}

export function withReasonUpgradeNotStarted(): CheckOption {
  return (condition: IStatusCondition) =>
    condition.reason === conditionReasonUpgradeNotStarted;
}

export function withReasonUpgradePending(): CheckOption {
  return (condition: IStatusCondition) =>
    condition.reason === conditionReasonUpgradePending;
}
