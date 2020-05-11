interface IScaling {
  min: number;
  max: number;
}

interface INodePoolStatus {
  nodes: number;
  nodes_ready: number;
  spot_instances: number;
  instance_types: string[];
}

export interface INodePool {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availability_zones: any;
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node_spec: any;
  scaling: IScaling;
  status: INodePoolStatus;
}

export interface IKeyPair {
  certificate_organizations: string;
  cn_prefix: string;
  description: string;
  ttl_hours: number;
}

export type PropertiesOf<T> = T[keyof T];
