declare namespace V4 {
  export interface IClusterScaling {
    min?: number;
    max?: number;
  }

  export interface IClusterCPU {
    cores: number;
  }

  export interface IClusterMemory {
    size_gb: number;
  }

  export interface IClusterStorage {
    size_gb: number;
  }

  export interface IClusterWorkerAWS {
    instance_type: string;
  }

  export interface IClusterWorkerAzure {
    vm_size: string;
  }

  export interface IClusterWorker {
    labels: IClusterLabelMap | null;
    cpu: IClusterCPU;
    memory: IClusterMemory;
    storage: IClusterStorage;
    aws?: IClusterWorkerAWS;
    azure?: IClusterWorkerAzure;
  }

  export interface IClusterMaster {
    cpu: IClusterCPU;
    memory: IClusterMemory;
    storage: IClusterStorage;
  }

  export interface IClusterAWS {
    resource_tags: Record<string, string>;
  }

  export interface IClusterKVM {
    port_mappings?: IClusterKVMProtocolPort[];
  }

  export interface IClusterKVMProtocolPort {
    port: number;
    protocol: string;
  }

  export interface IClusterStatusAWSAvailabilityZoneSubnet {
    cidr: string;
  }

  export interface IClusterStatusAWSAvailabilityZone {
    name: string;
    subnet: {
      private: IClusterStatusAWSAvailabilityZoneSubnet;
      public: IClusterStatusAWSAvailabilityZoneSubnet;
    };
  }

  export interface IClusterStatusAWS {
    availabilityZones: IClusterStatusAWSAvailabilityZone[] | null;
    autoScalingGroup: {
      name: string;
    };
  }

  export interface IClusterStatusCluster {
    conditions: IClusterStatusCondition[] | null;
    network: IClusterStatusNetwork;
    nodes: IClusterStatusNode[] | null;
    scaling: IClusterStatusScaling;
    resources: IClusterStatusResource[] | null;
    versions: IClusterStatusVersion[] | null;
  }

  export interface IClusterStatusNode {
    lastTransitionTime: string | null;
    name: string;
    version: string;
    labels?: IClusterLabelMap;
  }

  export interface IClusterStatusNetwork {
    cidr: string;
  }

  export interface IClusterStatusScaling {
    desiredCapacity: number;
  }

  export interface IClusterStatusCondition {
    lastTransitionTime: string | null;
    status: string;
    type: string;
  }

  export interface IClusterStatusResource {
    name: string;
    conditions: IClusterStatusCondition[];
  }

  export interface IClusterStatusVersion {
    date: string;
    lastTransitionTime: string | null;
    semver: string;
  }

  export interface IClusterStatus {
    aws: IClusterStatusAWS;
    cluster: IClusterStatusCluster;
  }

  export interface ICluster extends IBaseCluster {
    credential_id: string;

    name?: string;
    release_version?: string;
    kvm?: IClusterKVM;
    aws?: IClusterAWS;
    availability_zones?: string[];
    scaling?: IClusterScaling;
    masters?: IClusterMaster[];
    workers?: IClusterWorker[];

    // Injected by client-side.
    status?: IClusterStatus;
  }
}
