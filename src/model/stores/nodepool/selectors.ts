import { selectClusterById } from 'model/stores/cluster/selectors';
import {
  getCpusTotalNodePools,
  getMemoryTotalNodePools,
  getNumberOfNodePoolsNodes,
} from 'model/stores/cluster/utils';
import { IState } from 'model/stores/state';
import { createDeepEqualSelector } from 'model/stores/utils';

export function selectNodePools(state: IState): Record<string, INodePool> {
  return state.entities.nodePools.items;
}

export function selectClusterNodePoolIDs(
  state: IState,
  props: { cluster: V5.ICluster }
) {
  const cluster = selectClusterById(state, props.cluster.id);
  if (cluster) {
    return (cluster as V5.ICluster).nodePools;
  }

  return undefined;
}

export function selectClusterNodePools(
  state: IState,
  clusterID: string
): INodePool[] {
  const cluster = selectClusterById(state, clusterID) as
    | V5.ICluster
    | undefined;
  const clusterNodePoolsIDs: string[] | undefined = cluster?.nodePools;
  if (!clusterNodePoolsIDs) return [];

  const allNodePools = selectNodePools(state);

  return clusterNodePoolsIDs.map((nodePoolID) => allNodePools[nodePoolID]);
}

export const makeV5ResourcesSelector = () =>
  createDeepEqualSelector(
    [selectNodePools, selectClusterNodePoolIDs],
    (
      nodePools: Record<string, INodePool>,
      clusterNodePoolsIDs: string[] | undefined
    ) => {
      let clusterNodePools: INodePool[] = [];
      if (Object.values(nodePools).length > 0 && clusterNodePoolsIDs) {
        clusterNodePools = clusterNodePoolsIDs.map((np) => nodePools[np]);
      }

      const numberOfNodes = getNumberOfNodePoolsNodes(clusterNodePools);
      const memory = getMemoryTotalNodePools(clusterNodePools);
      const cores = getCpusTotalNodePools(clusterNodePools);

      return { numberOfNodes, memory, cores };
    }
  );
