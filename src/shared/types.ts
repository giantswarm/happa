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

export type PropertiesOf<T> = T[keyof T];
