import nock from 'nock';

/***** Constants *****/
export const API_ENDPOINT = 'http://localhost:8000';
export const USER_EMAIL = 'developer@giantswarm.io';
export const ORGANIZATION = 'acme';
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
    availability_zones: { default: 1, max: 3 },
    installation_name: 'local',
    provider: 'aws',
  },
  stats: {
    cluster_creation_duration: { median: 805, p25: 657, p75: 1031 },
  },
  workers: {
    count_per_cluster: { max: null, default: 3 },
    instance_type: {
      options: [
        'm5.large',
        'm3.large',
        'm3.xlarge',
        'm3.2xlarge',
        'r3.large',
        'r3.xlarge',
        'r3.2xlarge',
        'r3.4xlarge',
        'r3.8xlarge',
        'm4.xlarge',
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
export const v5ClustersResponse = [
  {
    create_date: '2019-11-08T13:50:32.333996123Z',
    id: V5_CLUSTER.id,
    name: 'V5 CLUSTER',
    owner: 'giantswarm',
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
};

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
