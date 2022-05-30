declare namespace V5 {
  export interface IClusterMaster {
    availability_zone: string;
  }

  export interface IClusterMasterNodes {
    availability_zones: string[] | null;
    high_availability: boolean;
    num_ready: number | null;
  }

  export interface IClusterVersion {
    last_transition_time: string | null;
    version: string;
  }

  export interface IClusterCondition {
    last_transition_time: string | null;
    condition: string;
  }

  export interface ICluster extends IBaseCluster {
    master: IClusterMaster;
    master_nodes: IClusterMasterNodes | null;

    labels?: IClusterLabelMap;
    rawLabels?: IClusterLabelMap;
    conditions?: IClusterCondition[];
    versions?: IClusterVersion[];

    // Injected by client-side.
    nodePools?: string[];
  }
}
