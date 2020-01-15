import {
  API_ENDPOINT,
  ORGANIZATION,
  V4_CLUSTER,
  V5_CLUSTER,
} from './constantsAndHelpers';

export const v4ClustersResponse = [
  {
    create_date: '2019-11-15T15:53:58.549065412Z',
    id: V4_CLUSTER.id,
    name: V4_CLUSTER.name,
    owner: ORGANIZATION,
    release_version: V4_CLUSTER.releaseVersion,
    path: `/v4/clusters/${V4_CLUSTER.id}/`,
  },
];

export const v4AWSClusterResponse = {
  id: V4_CLUSTER.id,
  create_date: '2019-11-15T15:53:59Z',
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
  create_date: '2019-11-29T09:40:45Z',
  api_endpoint: `https://api.${V4_CLUSTER.id}.k8s.godsmack.westeurope.azure.gigantic.io`,
  owner: ORGANIZATION,
  name: V4_CLUSTER.name,
  release_version: '9.1.0',
  scaling: { min: 2, max: 2 },
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
  create_date: '2019-11-26T19:59:15Z',
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
    create_date: '2019-11-08T13:50:32.333996123Z',
    id: V5_CLUSTER.id,
    name: 'V5 CLUSTER',
    owner: ORGANIZATION,
    path: `/v5/clusters/${V5_CLUSTER.id}/`,
    release_version: V5_CLUSTER.releaseVersion,
  },
];

export const v5ClusterResponse = {
  api_endpoint: API_ENDPOINT,
  create_date: '2019-11-10T19:22:08Z',
  id: V5_CLUSTER.id,
  master: { availability_zone: 'eu-central-1a' },
  name: V5_CLUSTER.name,
  owner: ORGANIZATION,
  release_version: V5_CLUSTER.releaseVersion,
  conditions: [
    {
      last_transition_time: '2019-11-10T19:33:22.865459577Z',
      condition: 'Created',
    },
    {
      last_transition_time: '2019-11-10T19:22:16.166784082Z',
      condition: 'Creating',
    },
  ],
  versions: [
    {
      last_transition_time: '2019-11-10T19:38:23.674938735Z',
      version: '10.0.0',
    },
  ],
};
