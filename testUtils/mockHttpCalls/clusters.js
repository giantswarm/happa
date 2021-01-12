import {
  API_ENDPOINT,
  ORGANIZATION,
  V4_CLUSTER,
  V5_CLUSTER,
} from './constantsAndHelpers';

const clusterCreateDateToday = new Date().toISOString();

export const v4ClustersResponse = [
  {
    create_date: clusterCreateDateToday,
    id: V4_CLUSTER.id,
    name: V4_CLUSTER.name,
    owner: ORGANIZATION,
    release_version: V4_CLUSTER.releaseVersion,
    path: `/v4/clusters/${V4_CLUSTER.id}/`,
  },
];

export const v4AWSClusterResponse = {
  id: V4_CLUSTER.id,
  create_date: clusterCreateDateToday,
  api_endpoint: `https://api.${V4_CLUSTER.id}.k8s.gauss.eu-central-1.aws.gigantic.io`,
  owner: ORGANIZATION,
  name: V4_CLUSTER.name,
  release_version: V4_CLUSTER.releaseVersion,
  scaling: { min: 3, max: 3 },
  credential_id: '',
  workers: [
    {
      cpu: { cores: 4 },
      labels: {},
      memory: { size_gb: 16 },
      storage: { size_gb: 0 },
      aws: { instance_type: V4_CLUSTER.AWSInstanceType },
    },
    {
      cpu: { cores: 4 },
      labels: {},
      memory: { size_gb: 16 },
      storage: { size_gb: 0 },
      aws: { instance_type: V4_CLUSTER.AWSInstanceType },
    },
    {
      cpu: { cores: 4 },
      labels: {},
      memory: { size_gb: 16 },
      storage: { size_gb: 0 },
      aws: { instance_type: V4_CLUSTER.AWSInstanceType },
    },
  ],
};

export const v4AzureClusterResponse = {
  id: V4_CLUSTER.id,
  create_date: clusterCreateDateToday,
  api_endpoint: `https://api.${V4_CLUSTER.id}.k8s.godsmack.westeurope.azure.gigantic.io`,
  owner: ORGANIZATION,
  name: V4_CLUSTER.name,
  release_version: '11.1.0',
  availability_zones: ['1', '2', '3'],
  scaling: { min: 3, max: 3 },
  credential_id: '',
  workers: [
    {
      cpu: { cores: 4 },
      labels: null,
      memory: { size_gb: 17.179869183999998 },
      storage: { size_gb: 34.359738367999995 },
      azure: { vm_size: V4_CLUSTER.AzureInstanceType },
    },
    {
      cpu: { cores: 4 },
      labels: null,
      memory: { size_gb: 17.179869183999998 },
      storage: { size_gb: 34.359738367999995 },
      azure: { vm_size: V4_CLUSTER.AzureInstanceType },
    },
  ],
};

export const v4KVMClusterResponse = {
  id: V4_CLUSTER.id,
  create_date: clusterCreateDateToday,
  api_endpoint: `https://api.${V4_CLUSTER.id}.k8s.geckon.gridscale.kvm.gigantic.io`,
  owner: ORGANIZATION,
  name: V4_CLUSTER.name,
  release_version: '9.1.0',
  scaling: { min: 3, max: 3 },
  credential_id: '',
  kvm: {
    port_mappings: [
      { port: 30168, protocol: 'http' },
      { port: 30169, protocol: 'https' },
    ],
  },
  workers: [
    {
      cpu: { cores: 2 },
      labels: {},
      memory: { size_gb: 7.5 },
      storage: { size_gb: 40 },
    },
    {
      cpu: { cores: 2 },
      labels: {},
      memory: { size_gb: 7.5 },
      storage: { size_gb: 40 },
    },
    {
      cpu: { cores: 2 },
      labels: {},
      memory: { size_gb: 7.5 },
      storage: { size_gb: 40 },
    },
  ],
};

export const v5ClustersResponse = [
  {
    create_date: clusterCreateDateToday,
    id: V5_CLUSTER.id,
    name: V5_CLUSTER.name,
    owner: ORGANIZATION,
    path: `/v5/clusters/${V5_CLUSTER.id}/`,
    release_version: V5_CLUSTER.releaseVersion,
    labels: {
      ding: 'dong',
      'giantswarm.io/hidden-label': 'ok',
    },
  },
];

export const v5ClusterResponse = {
  api_endpoint: API_ENDPOINT,
  create_date: clusterCreateDateToday,
  id: V5_CLUSTER.id,
  master: { availability_zone: 'eu-central-1a' },
  master_nodes: {
    high_availability: false,
    availability_zones: ['b'],
    num_ready: 0,
  },
  name: V5_CLUSTER.name,
  owner: ORGANIZATION,
  release_version: V5_CLUSTER.releaseVersion,
  conditions: [
    {
      last_transition_time: clusterCreateDateToday,
      condition: 'Creating',
    },
    {
      last_transition_time: clusterCreateDateToday,
      condition: 'Created',
    },
  ],
  versions: [
    {
      last_transition_time: clusterCreateDateToday,
      version: '10.0.0',
    },
  ],
  labels: {
    ding: 'dong',
    'giantswarm.io/hidden-label': 'ok',
  },
};
