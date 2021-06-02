export interface IClusterItem {
  name?: string;
  namespace?: string;
  description?: string;
  creationDate?: string;
  deletionDate?: string | null;
  releaseVersion?: string;
  k8sVersion?: string;
  workerNodePoolsCount?: number;
  workerNodesCount?: number;
  workerNodesCPU?: number;
  workerNodesMemory?: number; // In gigabytes.
}
