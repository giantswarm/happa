const mockedNodePool = {
  id: 'a0sdi',
  name: 'awesome-nodepool-0',
  availability_zones: ['europe-west-1a', 'europe-west-1b'],
  scaling: { Min: 3, Max: 5 },
  node_spec: {
    aws: { instance_type: 'm3.xlarge' },
    labels: ['beta-app'],
    volume_sizes: { docker: 100, kubelet: 100 },
  },
  status: { nodes: 4, nodes_ready: 4 },
  subnet: '10.0.0.0/24',
};

export default mockedNodePool;
