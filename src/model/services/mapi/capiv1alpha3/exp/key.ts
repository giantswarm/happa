import { Constants } from 'shared/constants';

import { IMachinePool } from './types';

export const labelMachinePool = 'giantswarm.io/machine-pool';

export const annotationMachinePoolDescription =
  'machine-pool.giantswarm.io/name';
export const annotationMachinePoolMinSize =
  'cluster.k8s.io/cluster-api-autoscaler-node-group-min-size';
export const annotationMachinePoolMaxSize =
  'cluster.k8s.io/cluster-api-autoscaler-node-group-max-size';

export function getMachinePoolDescription(machinePool: IMachinePool): string {
  let name =
    machinePool.metadata.annotations?.[annotationMachinePoolDescription];
  name ??= Constants.DEFAULT_NODEPOOL_DESCRIPTION;

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
