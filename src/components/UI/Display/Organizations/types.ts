export interface IOrganizationDetailClustersSummary {
  nodesCount?: number;
  nodesMemory?: number; // In gigabytes.
  nodesCPU?: number;
  workerNodesCount?: number;
  workerNodesMemory?: number; // In gigabytes.
  workerNodesCPU?: number;
}

export interface IOrganizationDetailReleasesSummary {
  oldestReleaseVersion?: string;
  oldestReleaseK8sVersion?: string;
  newestReleaseVersion?: string;
  newestReleaseK8sVersion?: string;
  releasesInUseCount?: number;
}

export interface IOrganizationDetailVersionsSummary {
  oldestClusterAppVersion?: string;
  newestClusterAppVersion?: string;
  clusterAppVersionsInUseCount?: number;
  oldestK8sVersion?: string;
  newestK8sVersion?: string;
  k8sVersionsInUseCount?: number;
}
