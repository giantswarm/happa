export interface IClusterState {
  lastUpdated: number;
  isFetching: boolean;
  items: Record<string, V4.ICluster | V5.ICluster>;
  v5Clusters: string[];
}
