export interface INodePoolNodeSpecAWSInstanceDistribution {
  on_demand_base_capacity: number;
  on_demand_percentage_above_base_capacity: number;
}

export interface INodePoolNodeSpecAWS {
  instance_distribution: INodePoolNodeSpecAWSInstanceDistribution;
  instance_type: string;
  use_alike_instance_types: boolean;
}

export interface INodePoolNodeSpecAzure {
  vm_size: string;
}

export interface INodePoolNodeSpecVolumeSizesGB {
  docker: number;
  kubelet: number;
}

export interface INodePoolNodeSpec {
  aws: INodePoolNodeSpecAWS | null;
  azure: INodePoolNodeSpecAzure | null;
  volume_sizes_gb: INodePoolNodeSpecVolumeSizesGB | null;
}

export interface INodePoolScaling {
  min: number;
  max: number;
}

export interface INodePoolStatus {
  nodes: number;
  nodes_ready: number;
  spot_instances: number;
  instance_types: string[] | null;
}

export interface INodePool {
  availability_zones: string[] | null;
  id: string;
  name: string;
  subnet: string;
  node_spec: INodePoolNodeSpec | null;
  scaling: INodePoolScaling | null;
  // When a node pool is created, this field is not in the server response.
  status?: INodePoolStatus | null;
}

export interface IKeyPair {
  certificate_organizations: string;
  cn_prefix: string;
  description: string;
  ttl_hours: number;
  certificate_authority_data: string;
  client_certificate_data: string;
  client_key_data: string;
}

export type PropertiesOf<T> = T[keyof T];
