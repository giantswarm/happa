import { Constants } from 'model/constants';
import * as corev1 from 'model/services/mapi/corev1';

import { ICluster, ICondition } from './';

export const labelOrganization = 'giantswarm.io/organization';
export const labelCluster = 'giantswarm.io/cluster';
export const labelClusterName = 'cluster.x-k8s.io/cluster-name';
export const labelReleaseVersion = 'release.giantswarm.io/version';
export const labelMachineControlPlane = 'cluster.x-k8s.io/control-plane';

export const annotationClusterDescription = 'cluster.giantswarm.io/description';
export const annotationUpdateScheduleTargetRelease =
  'alpha.giantswarm.io/update-schedule-target-release';
export const annotationUpdateScheduleTargetTime =
  'alpha.giantswarm.io/update-schedule-target-time';

export const conditionTypeReady = 'Ready';
export const conditionTypeCreating = 'Creating';
export const conditionTypeUpgrading = 'Upgrading';

export const conditionReasonCreationCompleted = 'CreationCompleted';
export const conditionReasonExistingObject = 'ExistingObject';
export const conditionReasonUpgradeCompleted = 'UpgradeCompleted';
export const conditionReasonUpgradeNotStarted = 'UpgradeNotStarted';
export const conditionReasonUpgradePending = 'UpgradePending';

export function getClusterDescription(cluster: ICluster): string {
  let name = cluster.metadata.annotations?.[annotationClusterDescription];
  name ||= Constants.DEFAULT_CLUSTER_DESCRIPTION;

  return name;
}

export function getReleaseVersion(cluster: ICluster): string | undefined {
  return cluster.metadata.labels?.[labelReleaseVersion];
}

export function getClusterOrganization(cluster: ICluster): string | undefined {
  return cluster.metadata.labels?.[labelOrganization];
}

export function getKubernetesAPIEndpointURL(
  cluster: ICluster
): string | undefined {
  const hostname = cluster.spec?.controlPlaneEndpoint?.host;
  if (!hostname) return '';

  return `https://${hostname}`;
}

export function getClusterLabels(cluster: ICluster): Record<string, string> {
  if (!cluster.metadata.labels) return {};

  return cluster.metadata.labels;
}

interface IConditionGetter {
  status?: {
    conditions?: ICondition[];
  };
}

export function getCondition(
  cr: IConditionGetter,
  type: string
): ICondition | undefined {
  const conditions = cr.status?.conditions;
  if (!conditions) return undefined;

  return conditions.find((c) => c.type === type);
}

export function hasCondition(cr: IConditionGetter, type: string): boolean {
  return typeof getCondition(cr, type) !== 'undefined';
}

export function isConditionTrue(
  cr: IConditionGetter,
  type: string,
  ...checkOptions: CheckOption[]
): boolean {
  const condition = getCondition(cr, type);
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
  cr: IConditionGetter,
  type: string,
  ...checkOptions: CheckOption[]
): boolean {
  const condition = getCondition(cr, type);
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
  cr: IConditionGetter,
  type: string,
  ...checkOptions: CheckOption[]
): boolean {
  const condition = getCondition(cr, type);
  if (!condition) return false;

  if (condition.status === corev1.conditionUnknown) {
    return true;
  }

  for (const checkOption of checkOptions) {
    if (checkOption(condition)) return true;
  }

  return false;
}

export type CheckOption = (condition: ICondition) => boolean;

export function withReasonCreationCompleted(): CheckOption {
  return (condition: ICondition) =>
    condition.reason === conditionReasonCreationCompleted;
}

export function withReasonExistingObject(): CheckOption {
  return (condition: ICondition) =>
    condition.reason === conditionReasonExistingObject;
}

export function withReasonUpgradeCompleted(): CheckOption {
  return (condition: ICondition) =>
    condition.reason === conditionReasonUpgradeCompleted;
}

export function withReasonUpgradeNotStarted(): CheckOption {
  return (condition: ICondition) =>
    condition.reason === conditionReasonUpgradeNotStarted;
}

export function withReasonUpgradePending(): CheckOption {
  return (condition: ICondition) =>
    condition.reason === conditionReasonUpgradePending;
}

export function getClusterUpdateScheduleTargetRelease(
  cluster: ICluster
): string | undefined {
  return cluster.metadata.annotations?.[annotationUpdateScheduleTargetRelease];
}

export function getClusterUpdateScheduleTargetTime(
  cluster: ICluster
): string | undefined {
  return cluster.metadata.annotations?.[annotationUpdateScheduleTargetTime];
}
