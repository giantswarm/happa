export interface IClusterItem {
  name?: string;
  namespace?: string;
  description?: string;
  creationDate?: string;
  deletionDate?: string | null;
  releaseVersion?: string;
  labels?: Record<string, string>;
  workerNodePoolsCount?: number;
  workerNodesCount?: number;
  workerNodesCPU?: number;
  workerNodesMemory?: number; // In gigabytes.
  appsCount?: number;
  appsUniqueCount?: number;
  appsDeployedCount?: number;
  activeKeyPairsCount?: number;
  k8sApiURL?: string;
}

export interface IControlPlaneNodeItem {
  availabilityZone: string;
  isReady: boolean;
}
