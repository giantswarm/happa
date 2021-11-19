interface INodePoolNodeSpecAWSInstanceDistribution {
  on_demand_base_capacity: number;
  on_demand_percentage_above_base_capacity: number;
}

interface INodePoolNodeSpecAWS {
  instance_distribution: INodePoolNodeSpecAWSInstanceDistribution;
  instance_type: string;
  use_alike_instance_types: boolean;
}

interface INodePoolNodeSpecAzureSpotInstances {
  enabled: boolean;
  max_price: number;
}

interface INodePoolNodeSpecAzure {
  vm_size: string;
  spot_instances?: INodePoolNodeSpecAzureSpotInstances;
}

interface INodePoolNodeSpecVolumeSizesGB {
  docker: number;
  kubelet: number;
}

interface INodePoolNodeSpec {
  aws: INodePoolNodeSpecAWS | null;
  azure: INodePoolNodeSpecAzure | null;
  volume_sizes_gb: INodePoolNodeSpecVolumeSizesGB | null;
}

interface INodePoolScaling {
  min: number;
  max: number;
}

interface INodePoolStatus {
  nodes: number;
  nodes_ready: number;
  spot_instances: number;
  instance_types: string[] | null;
}

interface INodePool {
  availability_zones: string[] | null;
  id: string;
  name: string;
  subnet: string;
  node_spec: INodePoolNodeSpec | null;
  scaling: INodePoolScaling | null;
  // When a node pool is created, this field is not in the server response.
  status?: INodePoolStatus | null;
}
