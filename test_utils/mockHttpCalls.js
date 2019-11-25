import nock from 'nock';

/***** Constants *****/
export const API_ENDPOINT = 'http://localhost:8000';
export const USER_EMAIL = 'developer@giantswarm.io';
export const ORGANIZATION = 'acme';
export const V4_CLUSTER = {
  id: '7ccr6',
  name: 'My v4 cluster',
  releaseVersion: '8.5.0',
  instanceType: 'm4.xlarge',
};
export const V5_CLUSTER = {
  id: 'm0ckd',
  name: 'All purpose cluster',
  releaseVersion: '10.0.0',
};

/***** Helper functions *****/
export const getMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT)
    .get(endpoint)
    .reply(200, response);

export const getPersistedMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT)
    .persist()
    .get(endpoint)
    .reply(200, response);

export const postMockCall = (endpoint, response = []) =>
  nock(API_ENDPOINT)
    .post(endpoint)
    .reply(200, response);

/***** Responses *****/

// Info
export const infoResponse = {
  general: {
    availability_zones: {
      default: 1,
      max: 3,
      zones: ['eu-central-1a', 'eu-central-1b', 'eu-central-1c'],
    },
    datacenter: 'eu-central-1',
    installation_name: 'local',
    provider: 'aws',
  },
  features: { nodepools: { release_version_minimum: '10.0.0' } },
  stats: { cluster_creation_duration: { median: 805, p25: 657, p75: 1031 } },
  workers: {
    count_per_cluster: { max: null, default: 3 },
    instance_type: {
      options: [
        'c5.large',
        'c5.xlarge',
        'c5.2xlarge',
        'c5.4xlarge',
        'c5.9xlarge',
        'i3.xlarge',
        'm3.large',
        'm3.xlarge',
        'm3.2xlarge',
        'm4.large',
        'm4.xlarge',
        'm4.2xlarge',
        'm4.4xlarge',
        'm5.large',
        'm5.xlarge',
        'm5.2xlarge',
        'm5.4xlarge',
        'r3.large',
        'r3.xlarge',
        'r3.2xlarge',
        'r3.4xlarge',
        'r3.8xlarge',
        'r5.2xlarge',
        't2.large',
        't2.xlarge',
        't2.2xlarge',
        'p2.xlarge',
        'p3.2xlarge',
        'p3.8xlarge',
      ],
      default: 'm4.xlarge',
    },
  },
};

// User
export const userResponse = {
  email: USER_EMAIL,
  created: '2019-09-19T12:40:16.2231629Z',
  expiry: '2020-01-01T00:00:00Z',
};

// Auth
export const authTokenResponse = {
  auth_token: 'efeb3f94-8deb-41a0-84cc-713801ff165e',
};

// Clusters

export const v4ClustersResponse = [
  {
    create_date: '2019-11-15T15:53:58.549065412Z',
    delete_date: '0001-01-01T00:00:00Z',
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
  api_endpoint: 'https://api.7ccr6.k8s.gauss.eu-central-1.aws.gigantic.io',
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
      aws: { instance_type: V4_CLUSTER.instanceType },
    },
    {
      cpu: { cores: 4 },
      labels: {},
      memory: { size_gb: 16 },
      storage: { size_gb: 0 },
      aws: { instance_type: V4_CLUSTER.instanceType },
    },
    {
      cpu: { cores: 4 },
      labels: {},
      memory: { size_gb: 16 },
      storage: { size_gb: 0 },
      aws: { instance_type: V4_CLUSTER.instanceType },
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

// Organizations
export const orgsResponse = [{ id: ORGANIZATION }];

export const orgResponse = {
  id: ORGANIZATION,
  members: [{ email: USER_EMAIL }],
  credentials: [],
};

// Status
export const v4AWSClusterStatusResponse = {
  aws: {
    availabilityZones: [
      {
        name: 'eu-central-1a',
        subnet: {
          private: { cidr: '10.1.2.0/25' },
          public: { cidr: '10.1.2.128/25' },
        },
      },
    ],
    autoScalingGroup: { name: '' },
  },
  cluster: {
    conditions: [
      {
        lastTransitionTime: '2019-11-15T15:54:05.711696992Z',
        status: 'True',
        type: 'Creating',
      },
    ],
    network: { cidr: '10.1.2.0/24' },
    nodes: [
      {
        labels: {
          'aws-operator.giantswarm.io/version': '5.5.0',
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': V4_CLUSTER.instanceType,
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'eu-central-1',
          'failure-domain.beta.kubernetes.io/zone': 'eu-central-1c',
          'giantswarm.io/provider': 'aws',
          ip: '10.1.2.18',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'ip-10-1-2-18.eu-central-1.compute.internal',
          'kubernetes.io/os': 'linux',
          'kubernetes.io/role': 'worker',
          'node-role.kubernetes.io/worker': '',
          'node.kubernetes.io/worker': '',
          role: 'worker',
        },
        lastTransitionTime: '2019-11-14T05:28:11.958410127Z',
        name: 'ip-10-1-2-18.eu-central-1.compute.internal',
        version: '5.5.0',
      },
      {
        labels: {
          'aws-operator.giantswarm.io/version': '5.5.0',
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': V4_CLUSTER.instanceType,
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'eu-central-1',
          'failure-domain.beta.kubernetes.io/zone': 'eu-central-1c',
          'giantswarm.io/provider': 'aws',
          ip: '10.1.2.49',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'ip-10-1-2-49.eu-central-1.compute.internal',
          'kubernetes.io/os': 'linux',
          'kubernetes.io/role': 'master',
          'node-role.kubernetes.io/master': '',
          'node.kubernetes.io/master': '',
          role: 'master',
        },
        lastTransitionTime: '2019-11-14T05:28:11.958410751Z',
        name: 'ip-10-1-2-49.eu-central-1.compute.internal',
        version: '5.5.0',
      },
      {
        labels: {
          'aws-operator.giantswarm.io/version': '5.5.0',
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': V4_CLUSTER.instanceType,
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'eu-central-1',
          'failure-domain.beta.kubernetes.io/zone': 'eu-central-1c',
          'giantswarm.io/provider': 'aws',
          ip: '10.1.2.52',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'ip-10-1-2-52.eu-central-1.compute.internal',
          'kubernetes.io/os': 'linux',
          'kubernetes.io/role': 'worker',
          'node-role.kubernetes.io/worker': '',
          'node.kubernetes.io/worker': '',
          role: 'worker',
        },
        lastTransitionTime: '2019-11-14T05:28:11.958411157Z',
        name: 'ip-10-1-2-52.eu-central-1.compute.internal',
        version: '5.5.0',
      },
      {
        labels: {
          'aws-operator.giantswarm.io/version': '5.5.0',
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': V4_CLUSTER.instanceType,
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'eu-central-1',
          'failure-domain.beta.kubernetes.io/zone': 'eu-central-1c',
          'giantswarm.io/provider': 'aws',
          ip: '10.1.2.85',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'ip-10-1-2-85.eu-central-1.compute.internal',
          'kubernetes.io/os': 'linux',
          'kubernetes.io/role': 'worker',
          'node-role.kubernetes.io/worker': '',
          'node.kubernetes.io/worker': '',
          role: 'worker',
        },
        lastTransitionTime: '2019-11-14T05:28:11.958411586Z',
        name: 'ip-10-1-2-85.eu-central-1.compute.internal',
        version: '5.5.0',
      },
    ],
    resources: null,
    scaling: { desiredCapacity: 3 },
    versions: [],
  },
};

// Apps
export const appsResponse = [
  {
    metadata: { name: 'chart-operator' },
    spec: {
      catalog: 'default',
      name: 'chart-operator',
      namespace: 'giantswarm',
      user_config: {
        configmap: { name: '', namespace: '' },
        secret: { name: '', namespace: '' },
      },
      version: '0.10.8',
    },
    status: {
      app_version: '',
      release: { last_deployed: '0001-01-01T00:00:00Z', status: '' },
      version: '',
    },
  },
  {
    metadata: { name: 'kube-state-metrics' },
    spec: {
      catalog: 'default',
      name: 'kube-state-metrics-app',
      namespace: 'kube-system',
      user_config: {
        configmap: { name: '', namespace: '' },
        secret: { name: '', namespace: '' },
      },
      version: '0.6.0',
    },
    status: {
      app_version: '',
      release: { last_deployed: '0001-01-01T00:00:00Z', status: '' },
      version: '',
    },
  },
  {
    metadata: { name: 'metrics-server' },
    spec: {
      catalog: 'default',
      name: 'metrics-server-app',
      namespace: 'kube-system',
      user_config: {
        configmap: { name: '', namespace: '' },
        secret: { name: '', namespace: '' },
      },
      version: '0.4.1',
    },
    status: {
      app_version: '',
      release: { last_deployed: '0001-01-01T00:00:00Z', status: '' },
      version: '',
    },
  },
  {
    metadata: { name: 'node-exporter' },
    spec: {
      catalog: 'default',
      name: 'node-exporter-app',
      namespace: 'kube-system',
      user_config: {
        configmap: { name: '', namespace: '' },
        secret: { name: '', namespace: '' },
      },
      version: '0.6.0',
    },
    status: {
      app_version: '',
      release: { last_deployed: '0001-01-01T00:00:00Z', status: '' },
      version: '',
    },
  },
];

// Node Pools
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
    status: { nodes: 0, nodes_ready: 0 },
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
    status: { nodes: 0, nodes_ready: 0 },
    subnet: '10.1.7.0/24',
  },
];

// Releases
// Just thre of them: a false release, a pre node pools release and a node pools release
export const releasesResponse = [
  {
    active: false,
    changelog: [
      {
        component: 'cloudformation',
        description: 'Duplicate etcd record set into public hosted zone.',
      },
      {
        component: 'cloudformation',
        description:
          'Add ingress internal load-balancer in private hosted zone.',
      },
      {
        component: 'cloudformation',
        description:
          'Use private subnets for internal Kubernetes API loadbalancer.',
      },
    ],
    components: [
      {
        name: 'app-operator',
        version: '1.0.0',
      },
      {
        name: 'aws-operator',
        version: '5.3.1',
      },
      {
        name: 'calico',
        version: '3.8.2',
      },
      {
        name: 'cert-operator',
        version: '0.1.0',
      },
      {
        name: 'chart-operator',
        version: '0.7.0',
      },
      {
        name: 'cluster-autoscaler',
        version: '1.14.0',
      },
      {
        name: 'cluster-operator',
        version: '0.19.0',
      },
      {
        name: 'containerlinux',
        version: '2135.4.0',
      },
      {
        name: 'coredns',
        version: '1.6.2',
      },
      {
        name: 'docker',
        version: '18.06.1',
      },
      {
        name: 'etcd',
        version: '3.3.13',
      },
      {
        name: 'kube-state-metrics',
        version: '1.7.2',
      },
      {
        name: 'kubernetes',
        version: '1.14.6',
      },
      {
        name: 'metrics-server',
        version: '0.3.1',
      },
      {
        name: 'nginx-ingress-controller',
        version: '0.25.1',
      },
      {
        name: 'node-exporter',
        version: '0.18.0',
      },
      {
        name: 'vault',
        version: '0.10.3',
      },
    ],
    timestamp: '2019-09-24T11:00:00Z',
    version: '8.4.1',
  },
  {
    active: true,
    changelog: [
      {
        component: 'cloudformation',
        description:
          'Use private subnets for internal Kubernetes API loadbalancer.',
      },
      {
        component: 'cloudformation',
        description:
          'Add ingress internal load-balancer in private hosted zone.',
      },
      {
        component: 'cloudformation',
        description: 'Duplicate etcd record set into public hosted zone.',
      },
      {
        component: 'cloudformation',
        description:
          'Add public internal-api record set for Kubernetes API private load balancer.',
      },
      {
        component: 'cloudformation',
        description: 'Add whitelisting for internal Kubernetes API.',
      },
      {
        component: 'cluster-operator',
        description:
          'Add internal Kubernetes API domain into API certificate alternative names.',
      },
      {
        component: 'chart-operator',
        description: 'Install chart-operator from default catalog.',
      },
    ],
    components: [
      {
        name: 'app-operator',
        version: '1.0.0',
      },
      {
        name: 'aws-operator',
        version: '5.4.0',
      },
      {
        name: 'calico',
        version: '3.8.2',
      },
      {
        name: 'cert-operator',
        version: '0.1.0',
      },
      {
        name: 'chart-operator',
        version: '0.7.0',
      },
      {
        name: 'cluster-autoscaler',
        version: '1.14.0',
      },
      {
        name: 'cluster-operator',
        version: '0.20.0',
      },
      {
        name: 'containerlinux',
        version: '2135.4.0',
      },
      {
        name: 'coredns',
        version: '1.6.2',
      },
      {
        name: 'docker',
        version: '18.06.1',
      },
      {
        name: 'etcd',
        version: '3.3.13',
      },
      {
        name: 'kube-state-metrics',
        version: '1.7.2',
      },
      {
        name: 'kubernetes',
        version: '1.14.6',
      },
      {
        name: 'metrics-server',
        version: '0.3.1',
      },
      {
        name: 'nginx-ingress-controller',
        version: '0.25.1',
      },
      {
        name: 'node-exporter',
        version: '0.18.0',
      },
      {
        name: 'vault',
        version: '0.10.3',
      },
    ],
    timestamp: '2019-09-02T13:30:00Z',
    version: '8.5.0',
  },
  {
    active: true,
    changelog: [
      {
        component: 'cloudformation',
        description: 'Add IAMManager IAM role for kiam managed app.',
      },
      {
        component: 'cloudformation',
        description:
          'Add Route53Manager IAM role for external-dns managed app.',
      },
      {
        component: 'kubernetes',
        description: 'Updated from v1.14.6 to v1.15.5.',
      },
      {
        component: 'clusterapi',
        description:
          'Add cleanuprecordsets resource to cleanup non-managed route53 records.',
      },
      {
        component: 'nodepools',
        description:
          'Add Node Pools functionality. See https://docs.giantswarm.io/basics/nodepools/ for details.',
      },
      {
        component: 'kiam',
        description: 'Add managed kiam app into default app catalog(aws only).',
      },
      {
        component: 'external-dns',
        description: 'Add managed external-dns app into default app catalog.',
      },
      {
        component: 'cert-manager',
        description: 'Add managed cert-manager app into default app catalog.',
      },
    ],
    components: [
      {
        name: 'app-operator',
        version: '1.0.0',
      },
      {
        name: 'aws-operator',
        version: '7.0.0',
      },
      {
        name: 'calico',
        version: '3.9.1',
      },
      {
        name: 'cert-manager',
        version: '0.9.0',
      },
      {
        name: 'cert-operator',
        version: '0.1.0',
      },
      {
        name: 'chart-operator',
        version: '0.7.0',
      },
      {
        name: 'cluster-autoscaler',
        version: '1.15.2',
      },
      {
        name: 'cluster-operator',
        version: '1.0.0',
      },
      {
        name: 'containerlinux',
        version: '2191.5.0',
      },
      {
        name: 'coredns',
        version: '1.6.4',
      },
      {
        name: 'docker',
        version: '18.06.1',
      },
      {
        name: 'etcd',
        version: '3.3.15',
      },
      {
        name: 'external-dns',
        version: '0.5.11',
      },
      {
        name: 'kiam',
        version: '3.4.0',
      },
      {
        name: 'kube-state-metrics',
        version: '1.8.0',
      },
      {
        name: 'kubernetes',
        version: '1.15.5',
      },
      {
        name: 'metrics-server',
        version: '0.4.1',
      },
      {
        name: 'nginx-ingress-controller',
        version: '0.26.1',
      },
      {
        name: 'node-exporter',
        version: '0.18.0',
      },
      {
        name: 'vault',
        version: '0.10.3',
      },
    ],
    timestamp: '2019-10-31T11:00:00Z',
    version: '10.0.0',
  },
];

// App Catalogs
export const appCatalogsResponse = [
  {
    metadata: {
      name: 'control-plane-catalog',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'internal',
      },
    },
    spec: {
      title: 'Control Plane Catalog',
      description:
        'This catalog holds Apps exclusively running on Giant Swarm control planes. ',
      logoURL: '/images/repo_icons/giantswarm.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/control-plane-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'control-plane-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'internal',
      },
    },
    spec: {
      title: 'Control Plane Test Catalog',
      description: 'App Catalog for Control Plane apps test releases.',
      logoURL: '',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/control-plane-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'control-plane-test-catalog',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'internal',
      },
    },
    spec: {
      title: 'Control Plane Test Catalog',
      description:
        'This catalog holds test Apps exclusively running on Giant Swarm control planes. ',
      logoURL: '/images/repo_icons/giantswarm.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/control-plane-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'default',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'internal',
      },
    },
    spec: {
      title: 'Giant Swarm Default Catalog',
      description:
        'This catalog holds Apps managed by Giant Swarm that are installed by default and not chosen by customers. ',
      logoURL: '/images/repo_icons/giantswarm.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/default-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'default-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'test',
      },
    },
    spec: {
      title: 'Giant Swarm Default Test',
      description:
        'This catalog holds test versions of the apps in Giant Swarm Default. No guarantees, no SLA! Here be dragons! Giant Swarm developers only.',
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/default-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'internal',
      },
    },
    spec: {
      title: 'Giant Swarm Catalog',
      description: 'This catalog holds Apps managed by Giant Swarm. ',
      logoURL: '/images/repo_icons/giantswarm.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/giantswarm-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm-incubator',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'incubator',
      },
    },
    spec: {
      title: 'Giant Swarm Incubator',
      description: `This catalog holds Apps that Giant Swarm is considering adding to the stable catalog. For these Apps there's currently no SLA. Management and support will be done on a best-effort basis with the goal of learning operative processes and best-practice configuration for a successful graduation of the App to stable and SLA supported. This also allows customers to get started with these Apps and get a feeling for how they can be used for their use cases. Any feedback through your usual channels is appreciated. `,
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/giantswarm-incubator-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm-incubator-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'test',
      },
    },
    spec: {
      title: 'Giant Swarm Incubator Test',
      description:
        'This catalog holds test versions of the apps in Giant Swarm Incubator. No guarantees, no SLA! Here be dragons! Giant Swarm developers only.',
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/giantswarm-incubator-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm-operations-platform-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'test',
      },
    },
    spec: {
      title: 'Giant Swarm Operations Platform Test',
      description:
        'This catalog holds test versions of the apps in Giant Swarm Operations Platform. No guarantees, no SLA! Here be dragons! Giant Swarm developers only.',
      logoURL: '/images/repo_icons/managed.png',
      storage: {
        type: 'helm',
        URL:
          'https://giantswarm.github.com/giantswarm-operations-platform-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm-playground-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'test',
      },
    },
    spec: {
      title: 'Giant Swarm Playground Test',
      description:
        'This catalog holds applications that are not covered by any support plan. Still, we try to make them install and run on Giant Swarm smoothly!',
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL:
          'https://giantswarm.github.com/giantswarm-playground-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'giantswarm-test',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'test',
      },
    },
    spec: {
      title: 'Giant Swarm Test',
      description:
        'This catalog holds test versions of the apps in Giant Swarm. No guarantees, no SLA! Here be dragons! Giant Swarm developers only.',
      logoURL: '/images/repo_icons/incubator.png',
      storage: {
        type: 'helm',
        URL: 'https://giantswarm.github.com/giantswarm-test-catalog/',
      },
    },
  },
  {
    metadata: {
      name: 'helm-stable',
      labels: {
        'app-operator.giantswarm.io/version': '1.0.0',
        'application.giantswarm.io/catalog-type': 'community',
      },
    },
    spec: {
      title: 'Helm Stable',
      description:
        'This is the Helm Stable chart repository that you can find here: https://github.com/helm/charts/tree/master/stable This App Catalog does not have any guarantees or SLA. ',
      logoURL: '/images/repo_icons/community.png',
      storage: {
        type: 'helm',
        URL: 'https://kubernetes-charts.storage.googleapis.com/',
      },
    },
  },
];
