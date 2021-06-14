import { IControlPlaneNodeItem } from '../types';

export interface IControlPlaneNodesStats {
  totalCount: number;
  readyCount: number;
  availabilityZones: string[];
}

export function computeControlPlaneNodesStats(
  nodes: IControlPlaneNodeItem[]
): IControlPlaneNodesStats {
  const stats: IControlPlaneNodesStats = {
    totalCount: nodes.length,
    readyCount: 0,
    availabilityZones: [],
  };

  for (const node of nodes) {
    if (node.isReady) {
      stats.readyCount++;
    }

    if (node.availabilityZone) {
      stats.availabilityZones.push(node.availabilityZone);
    }
  }

  return stats;
}
