export interface IOrganizationDetailClustersSummary {
  nodesCount?: number;
  workerNodesCount?: number;
  workerNodesMemory?: number;
  workerNodesCPU?: number;
}

export interface IOrganizationDetailReleasesSummary {
  oldestReleaseVersion?: string;
  oldestReleaseK8sVersion?: string;
  newestReleaseVersion?: string;
  newestReleaseK8sVersion?: string;
  releasesInUseCount?: number;
}

export interface IOrganizationDetailAppsSummary {
  appsInUseCount?: number;
  appDeployments?: number;
}
