export const nodePoolsResponse = [
  {
    id: '3jx5q',
    name: 'My first node pool',
    availability_zones: ['eu-central-1a'],
    scaling: { min: 3, max: 10 },
    node_spec: {
      aws: { instance_type: 'm3.xlarge' },
      volume_sizes_gb: { docker: 100, kubelet: 100 },
    },
    status: { nodes: 3, nodes_ready: 3 },
    subnet: '10.1.8.0/24',
  },
  {
    id: '6pze3',
    name: 'My second node pool',
    availability_zones: ['eu-central-1a'],
    scaling: { min: 3, max: 10 },
    node_spec: {
      aws: { instance_type: 'm3.xlarge' },
      volume_sizes_gb: { docker: 100, kubelet: 100 },
    },
    status: { nodes: 3, nodes_ready: 3 },
    subnet: '10.1.7.0/24',
  },
];
