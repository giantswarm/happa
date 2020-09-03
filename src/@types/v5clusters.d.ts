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
    labels: IClusterLabelMap;
    master: IClusterMaster;
    masterNodes: IClusterMasterNodes | null;
    delete_date: string | null;

    conditions?: IClusterCondition[];
    versions?: IClusterVersion[];
  }
}
