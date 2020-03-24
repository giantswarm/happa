export const appResponseWithCustomConfig = {
  metadata: { name: 'my app', labels: {} },
  spec: {
    catalog: 'giantswarm',
    name: 'nginx-ingress-controller-app',
    namespace: 'giantswarm',
    user_config: {
      configmap: { name: 'test app', namespace: 'giantswarm' },
      secret: { name: 'secret test', namespace: 'giantswarm' },
    },
    version: '0.0.1',
  },
  status: {
    app_version: '',
    release: { last_deployed: '0001-01-01T00:00:00Z', status: '' },
    version: '',
  },
};

export const appResponseNoCatalog = {
  metadata: { name: 'sone app', labels: {} },
  spec: {
    catalog: 'INVISIBLE-CATALOG',
    name: 'some-app',
    namespace: 'giantswarm',
    user_config: {
      configmap: { name: '', namespace: '' },
      secret: { name: '', namespace: '' },
    },
    version: '0.0.1',
  },
  status: {
    app_version: '',
    release: { last_deployed: '0001-01-01T00:00:00Z', status: '' },
    version: '',
  },
};

export const appsResponse = [
  {
    metadata: { name: 'my app', labels: {} },
    spec: {
      catalog: 'giantswarm',
      name: 'my-app',
      namespace: 'giantswarm',
      user_config: {
        configmap: { name: '', namespace: '' },
        secret: { name: '', namespace: '' },
      },
      version: '0.0.1',
    },
    status: {
      app_version: '',
      release: { last_deployed: '0001-01-01T00:00:00Z', status: '' },
      version: '',
    },
  },
  {
    metadata: {
      name: 'chart-operator',
      labels: { 'giantswarm.io/managed-by': 'cluster-operator' },
    },
    spec: {
      catalog: 'giantswarm',
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
    metadata: {
      name: 'kube-state-metrics',
      labels: { 'giantswarm.io/managed-by': 'cluster-operator' },
    },
    spec: {
      catalog: 'giantswarm',
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
    metadata: {
      name: 'metrics-server',
      labels: { 'giantswarm.io/managed-by': 'cluster-operator' },
    },
    spec: {
      catalog: 'giantswarm',
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
    metadata: {
      name: 'node-exporter',
      labels: { 'giantswarm.io/managed-by': 'cluster-operator' },
    },
    spec: {
      catalog: 'giantswarm',
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
