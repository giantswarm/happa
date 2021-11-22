import { Constants } from 'model/constants';

import { IMachinePool } from './types';

export const labelClusterName = 'cluster.x-k8s.io/cluster-name';
export const labelMachinePool = 'giantswarm.io/machine-pool';

export const annotationMachinePoolDescription =
  'machine-pool.giantswarm.io/name';

export function getMachinePoolDescription(machinePool: IMachinePool): string {
  let name =
    machinePool.metadata.annotations?.[annotationMachinePoolDescription];
  name ||= Constants.DEFAULT_NODEPOOL_DESCRIPTION;

  return name;
}
