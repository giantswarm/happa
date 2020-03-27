interface IScaling {
  min: number;
  max: number;
}

interface INodePoolStatus {
  nodes: number;
  nodes_ready: number;
}

export interface INodePool {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availability_zones: any;
  id: string;
  name: string;
  node_spec: object;
  scaling: IScaling;
  status: INodePoolStatus;
}
