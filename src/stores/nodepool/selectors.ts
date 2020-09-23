import { IState } from 'reducers/types';
import { createDeepEqualSelector } from 'selectors/selectorUtils';
import { INodePool } from 'shared/types';
import {
  getCpusTotalNodePools,
  getMemoryTotalNodePools,
  getNumberOfNodePoolsNodes,
} from 'utils/clusterUtils';

export function selectNodePools(state: IState): Record<string, INodePool> {
  return state.entities.nodePools.items;
}

export function selectClusterNodePoolIDs(
  state: IState,
  props: { cluster: V5.ICluster }
): string[] {
  return state.entities.clusters.items[props.cluster.id].nodePools;
}

export function selectClusterNodePools(
  state: IState,
  clusterID: string
): INodePool[] {
  const clusterNodePoolsIDs: string[] | undefined =
    state.entities.clusters.items[clusterID]?.nodePools;
  if (!clusterNodePoolsIDs) return [];

  const allNodePools = selectNodePools(state);

  return (
    clusterNodePoolsIDs.map((nodePoolID) => allNodePools[nodePoolID]) ?? []
  );
}

export const makeV5ResourcesSelector = () =>
  createDeepEqualSelector(
    [selectNodePools, selectClusterNodePoolIDs],
    (nodePools: Record<string, INodePool>, clusterNodePoolsIDs: string[]) => {
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
