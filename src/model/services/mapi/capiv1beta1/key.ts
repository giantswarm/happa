import { Constants } from 'model/constants';
import * as corev1 from 'model/services/mapi/corev1';

import { ICluster, ICondition, IMachinePool } from './';

// CAPI labels
export const labelClusterName = 'cluster.x-k8s.io/cluster-name';
export const labelMachineControlPlane = 'cluster.x-k8s.io/control-plane';
export const labelRole = 'cluster.x-k8s.io/role';

// Giant Swarm labels
export const labelCluster = 'giantswarm.io/cluster';
export const labelMachinePool = 'giantswarm.io/machine-pool';
export const labelOrganization = 'giantswarm.io/organization';
export const labelServicePriority = 'giantswarm.io/service-priority';
export const labelAzureOperatorVersion = 'azure-operator.giantswarm.io/version';
export const labelClusterOperator = 'cluster-operator.giantswarm.io/version';
export const labelReleaseVersion = 'release.giantswarm.io/version';

// Cluster app labels
export const labelApp = 'app';
export const labelAppVersion = 'app.kubernetes.io/version';

export const annotationClusterDescription = 'cluster.giantswarm.io/description';
export const annotationUpdateScheduleTargetRelease =
  'alpha.giantswarm.io/update-schedule-target-release';
export const annotationUpdateScheduleTargetTime =
  'alpha.giantswarm.io/update-schedule-target-time';
export const annotationMachinePoolDescription =
  'machine-pool.giantswarm.io/name';
export const annotationMachinePoolMinSize =
  'cluster.k8s.io/cluster-api-autoscaler-node-group-min-size';
export const annotationMachinePoolMaxSize =
  'cluster.k8s.io/cluster-api-autoscaler-node-group-max-size';
export const annotationCGroupV1 = 'node.giantswarm.io/cgroupv1';

export const conditionTypeReady = 'Ready';
export const conditionTypeCreating = 'Creating';
export const conditionTypeUpgrading = 'Upgrading';
export const conditionTypeControlPlaneInitialized = 'ControlPlaneInitialized';

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

export function getClusterLabels(cluster: ICluster): IClusterLabelMap {
  if (!cluster.metadata.labels) return {};

  return cluster.metadata.labels;
}

export function getClusterServicePriority(cluster: ICluster): string {
  const labels = getClusterLabels(cluster);

  return labels[labelServicePriority];
}

export function getMachinePoolDescription(machinePool: IMachinePool): string {
  let name =
    machinePool.metadata.annotations?.[annotationMachinePoolDescription];
  name ||= Constants.DEFAULT_NODEPOOL_DESCRIPTION;

  return name;
}

export function getMachinePoolScaling(
  machinePool: IMachinePool
): readonly [number, number] {
  const annotations = machinePool.metadata.annotations;
  if (!annotations) return [-1, -1];

  const minScaling = annotations[annotationMachinePoolMinSize];
  const maxScaling = annotations[annotationMachinePoolMaxSize];
  if (!minScaling || !maxScaling) return [-1, -1];

  try {
    return [parseInt(minScaling, 10), parseInt(maxScaling, 10)];
  } catch {
    return [-1, -1];
  }
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
