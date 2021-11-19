import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';

export const v14_1_5: releasev1alpha1.IRelease = {
  apiVersion: 'release.giantswarm.io/v1alpha1',
  kind: releasev1alpha1.Release,
  metadata: {
    annotations: {
      'giantswarm.io/docs':
        'https://docs.giantswarm.io/reference/cp-k8s-api/releases.release.giantswarm.io/',
      'giantswarm.io/release-notes':
        'https://github.com/giantswarm/releases/tree/master/azure/v14.1.5',
      'meta.helm.sh/release-name': 'releases-azure-unique',
      'meta.helm.sh/release-namespace': 'giantswarm',
    },
    creationTimestamp: '2021-04-26T13:16:42Z',
    finalizers: ['operatorkit.giantswarm.io/release-operator-release'],
    generation: 1,
    labels: {
      'app.kubernetes.io/managed-by': 'Helm',
    },
    name: 'v14.1.5',
    resourceVersion: '294195041',
    selfLink: '/apis/release.giantswarm.io/v1alpha1/releases/v14.1.5',
    uid: '7b8cc075-55a3-400c-9ada-82ca976fc47c',
  },
  spec: {
    apps: [
      {
        catalog: 'default',
        name: 'cert-exporter',
        version: '1.6.0',
      },
      {
        catalog: 'default',
        name: 'chart-operator',
        version: '2.12.0',
      },
      {
        catalog: 'default',
        componentVersion: '1.6.5',
        name: 'coredns',
        version: '1.2.0',
      },
      {
        catalog: 'default',
        componentVersion: '0.7.6',
        name: 'external-dns',
        version: '2.3.0',
      },
      {
        catalog: 'default',
        componentVersion: '1.9.7',
        name: 'kube-state-metrics',
        version: '1.3.0',
      },
      {
        catalog: 'default',
        name: 'metrics-server',
        version: '1.2.1',
      },
      {
        catalog: 'default',
        name: 'net-exporter',
        version: '1.9.2',
      },
      {
        catalog: 'default',
        componentVersion: '1.0.1',
        name: 'node-exporter',
        version: '1.7.1',
      },
      {
        catalog: 'default',
        name: 'cluster-autoscaler',
        version: '1.19.1',
      },
      {
        catalog: 'default',
        name: 'azure-scheduled-events',
        version: '0.4.0',
      },
    ],
    components: [
      {
        catalog: 'control-plane-catalog',
        name: 'app-operator',
        releaseOperatorDeploy: true,
        version: '3.2.1',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'azure-operator',
        releaseOperatorDeploy: true,
        version: '5.5.3',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cert-operator',
        reference: '0.1.0-2',
        releaseOperatorDeploy: true,
        version: '0.1.0',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cluster-operator',
        releaseOperatorDeploy: true,
        version: '0.23.22',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'kubernetes',
        version: '1.19.10',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'containerlinux',
        version: '2765.2.2',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'calico',
        version: '3.15.3',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'etcd',
        version: '3.4.14',
      },
    ],
    date: '2021-04-26T09:18:37Z',
    state: 'active',
  },
  status: {
    inUse: true,
    ready: true,
  },
};

export const v14_0_1: releasev1alpha1.IRelease = {
  apiVersion: 'release.giantswarm.io/v1alpha1',
  kind: releasev1alpha1.Release,
  metadata: {
    annotations: {
      'giantswarm.io/docs':
        'https://docs.giantswarm.io/reference/cp-k8s-api/releases.release.giantswarm.io/',
      'giantswarm.io/release-notes':
        'https://github.com/giantswarm/releases/tree/master/azure/v14.0.1',
      'meta.helm.sh/release-name': 'releases-azure-unique',
      'meta.helm.sh/release-namespace': 'giantswarm',
    },
    creationTimestamp: '2021-04-26T13:16:42Z',
    finalizers: ['operatorkit.giantswarm.io/release-operator-release'],
    generation: 1,
    labels: {
      'app.kubernetes.io/managed-by': 'Helm',
    },
    name: 'v14.0.1',
    resourceVersion: '294195041',
    selfLink: '/apis/release.giantswarm.io/v1alpha1/releases/v14.0.1',
    uid: '7b8cc075-55a3-400c-9ada-82ca976fc47c',
  },
  spec: {
    apps: [
      {
        catalog: 'default',
        name: 'cert-exporter',
        version: '1.6.0',
      },
      {
        catalog: 'default',
        name: 'chart-operator',
        version: '2.12.0',
      },
      {
        catalog: 'default',
        componentVersion: '1.6.5',
        name: 'coredns',
        version: '1.2.0',
      },
      {
        catalog: 'default',
        componentVersion: '0.7.6',
        name: 'external-dns',
        version: '2.3.0',
      },
      {
        catalog: 'default',
        componentVersion: '1.9.7',
        name: 'kube-state-metrics',
        version: '1.3.0',
      },
      {
        catalog: 'default',
        name: 'metrics-server',
        version: '1.2.1',
      },
      {
        catalog: 'default',
        name: 'net-exporter',
        version: '1.9.2',
      },
      {
        catalog: 'default',
        componentVersion: '1.0.1',
        name: 'node-exporter',
        version: '1.7.1',
      },
      {
        catalog: 'default',
        name: 'cluster-autoscaler',
        version: '1.19.1',
      },
      {
        catalog: 'default',
        name: 'azure-scheduled-events',
        version: '0.4.0',
      },
    ],
    components: [
      {
        catalog: 'control-plane-catalog',
        name: 'app-operator',
        releaseOperatorDeploy: true,
        version: '3.2.1',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'azure-operator',
        releaseOperatorDeploy: true,
        version: '5.5.3',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cert-operator',
        reference: '0.1.0-2',
        releaseOperatorDeploy: true,
        version: '0.1.0',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cluster-operator',
        releaseOperatorDeploy: true,
        version: '0.23.22',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'kubernetes',
        version: '1.18.0',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'containerlinux',
        version: '2765.2.2',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'calico',
        version: '3.15.3',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'etcd',
        version: '3.4.14',
      },
    ],
    date: '2021-04-26T09:18:37Z',
    state: 'active',
  },
  status: {
    inUse: true,
    ready: true,
  },
};

export const v13_1_0: releasev1alpha1.IRelease = {
  apiVersion: 'release.giantswarm.io/v1alpha1',
  kind: releasev1alpha1.Release,
  metadata: {
    annotations: {
      'giantswarm.io/docs':
        'https://docs.giantswarm.io/reference/cp-k8s-api/releases.release.giantswarm.io/',
      'giantswarm.io/release-notes':
        'https://github.com/giantswarm/releases/tree/master/azure/v13.1.0',
      'meta.helm.sh/release-name': 'releases-azure-unique',
      'meta.helm.sh/release-namespace': 'giantswarm',
    },
    creationTimestamp: '2021-04-26T13:16:42Z',
    finalizers: ['operatorkit.giantswarm.io/release-operator-release'],
    generation: 1,
    labels: {
      'app.kubernetes.io/managed-by': 'Helm',
    },
    name: 'v13.1.0',
    resourceVersion: '294195041',
    selfLink: '/apis/release.giantswarm.io/v1alpha1/releases/v13.1.0',
    uid: '7b8cc075-55a3-400c-9ada-82ca976fc47c',
  },
  spec: {
    apps: [
      {
        catalog: 'default',
        name: 'cert-exporter',
        version: '1.6.0',
      },
      {
        catalog: 'default',
        name: 'chart-operator',
        version: '2.12.0',
      },
      {
        catalog: 'default',
        componentVersion: '1.6.5',
        name: 'coredns',
        version: '1.2.0',
      },
      {
        catalog: 'default',
        componentVersion: '0.7.6',
        name: 'external-dns',
        version: '2.3.0',
      },
      {
        catalog: 'default',
        componentVersion: '1.9.7',
        name: 'kube-state-metrics',
        version: '1.3.0',
      },
      {
        catalog: 'default',
        name: 'metrics-server',
        version: '1.2.1',
      },
      {
        catalog: 'default',
        name: 'net-exporter',
        version: '1.9.2',
      },
      {
        catalog: 'default',
        componentVersion: '1.0.1',
        name: 'node-exporter',
        version: '1.7.1',
      },
      {
        catalog: 'default',
        name: 'cluster-autoscaler',
        version: '1.19.1',
      },
      {
        catalog: 'default',
        name: 'azure-scheduled-events',
        version: '0.4.0',
      },
    ],
    components: [
      {
        catalog: 'control-plane-catalog',
        name: 'app-operator',
        releaseOperatorDeploy: true,
        version: '3.2.1',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'azure-operator',
        releaseOperatorDeploy: true,
        version: '5.5.3',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cert-operator',
        reference: '0.1.0-2',
        releaseOperatorDeploy: true,
        version: '0.1.0',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cluster-operator',
        releaseOperatorDeploy: true,
        version: '0.23.22',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'kubernetes',
        version: '1.17.6',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'containerlinux',
        version: '2765.2.2',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'calico',
        version: '3.15.3',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'etcd',
        version: '3.4.14',
      },
    ],
    date: '2021-04-26T09:18:37Z',
    state: 'active',
  },
  status: {
    inUse: true,
    ready: true,
  },
};

export const v15_0_0: releasev1alpha1.IRelease = {
  apiVersion: 'release.giantswarm.io/v1alpha1',
  kind: 'Release',
  metadata: {
    annotations: {
      'giantswarm.io/docs':
        'https://docs.giantswarm.io/reference/cp-k8s-api/releases.release.giantswarm.io/',
      'giantswarm.io/release-notes':
        'https://github.com/giantswarm/releases/tree/master/azure/v15.0.0',
      'meta.helm.sh/release-name': 'releases-azure',
      'meta.helm.sh/release-namespace': 'giantswarm',
    },
    creationTimestamp: '2021-06-15T07:33:33Z',
    finalizers: ['operatorkit.giantswarm.io/release-operator-release'],
    generation: 1,
    labels: {
      'app.kubernetes.io/managed-by': 'Helm',
    },
    name: 'v15.0.0',
    resourceVersion: '326011895',
    selfLink: '/apis/release.giantswarm.io/v1alpha1/releases/v15.0.0',
    uid: 'e610a7dc-2fee-45f5-bc42-c4920a8875a6',
  },
  spec: {
    apps: [
      {
        catalog: 'default',
        name: 'cert-exporter',
        version: '1.6.1',
      },
      {
        catalog: 'default',
        name: 'chart-operator',
        version: '2.14.0',
      },
      {
        catalog: 'default',
        componentVersion: '1.8.0',
        name: 'coredns',
        version: '1.4.1',
      },
      {
        catalog: 'default',
        componentVersion: '0.7.6',
        name: 'external-dns',
        version: '2.3.1',
      },
      {
        catalog: 'default',
        componentVersion: '1.9.7',
        name: 'kube-state-metrics',
        version: '1.3.1',
      },
      {
        catalog: 'default',
        name: 'metrics-server',
        version: '1.3.0',
      },
      {
        catalog: 'default',
        name: 'net-exporter',
        version: '1.10.1',
      },
      {
        catalog: 'default',
        componentVersion: '1.0.1',
        name: 'node-exporter',
        version: '1.7.2',
      },
      {
        catalog: 'default',
        name: 'cluster-autoscaler',
        version: '1.20.2',
      },
      {
        catalog: 'default',
        name: 'azure-scheduled-events',
        version: '0.4.0',
      },
    ],
    components: [
      {
        catalog: 'control-plane-catalog',
        name: 'app-operator',
        version: '4.4.0',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'azure-operator',
        releaseOperatorDeploy: true,
        version: '5.7.0',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cert-operator',
        releaseOperatorDeploy: true,
        version: '1.0.1',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cluster-operator',
        releaseOperatorDeploy: true,
        version: '0.27.1',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'kubernetes',
        version: '1.20.6',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'containerlinux',
        version: '2605.12.0',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'calico',
        version: '3.15.3',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'etcd',
        version: '3.4.14',
      },
    ],
    date: '2021-06-14T11:40:38Z',
    state: 'active',
  },
  status: {
    inUse: true,
    ready: true,
  },
};

export const v20_0_0_alpha: releasev1alpha1.IRelease = {
  apiVersion: 'release.giantswarm.io/v1alpha1',
  kind: 'Release',
  metadata: {
    annotations: {
      'giantswarm.io/docs':
        'https://docs.giantswarm.io/ui-api/management-api/crd/releases.release.giantswarm.io/',
      'giantswarm.io/release-notes':
        'https://github.com/giantswarm/releases/tree/master/aws/v20.0.0-alpha',
      'meta.helm.sh/release-name': 'releases-aws',
      'meta.helm.sh/release-namespace': 'giantswarm',
    },
    creationTimestamp: '2021-11-18T09:01:45Z',
    finalizers: ['operatorkit.giantswarm.io/release-operator-release'],
    generation: 1,
    labels: {
      'app.kubernetes.io/managed-by': 'Helm',
    },
    name: 'v20.0.0-alpha',
    resourceVersion: '344715917',
    selfLink: '/apis/release.giantswarm.io/v1alpha1/releases/v20.0.0-alpha',
    uid: '46e9a2b8-b998-4c24-ab5c-1437cca7aedc',
  },
  spec: {
    apps: [
      {
        catalog: 'default',
        componentVersion: '1.8.0',
        name: 'aws-cni',
        version: '0.1.0',
      },
      {
        catalog: 'default',
        componentVersion: '3.18.0',
        name: 'calico-policy-only',
        version: '0.3.0',
      },
      {
        catalog: 'default',
        name: 'capi-node-labeler',
        version: '0.3.3',
      },
      {
        catalog: 'default',
        name: 'cert-exporter',
        version: '1.6.1',
      },
      {
        catalog: 'default',
        componentVersion: '1.3.1',
        name: 'cert-manager',
        version: '2.7.1',
      },
      {
        catalog: 'default',
        name: 'chart-operator',
        version: '2.19.0',
      },
      {
        catalog: 'default',
        name: 'cluster-autoscaler',
        version: '1.19.3',
      },
      {
        catalog: 'default',
        componentVersion: '0.7.6',
        name: 'external-dns',
        version: '2.3.1',
      },
      {
        catalog: 'default',
        componentVersion: '4.1.0',
        name: 'kiam',
        version: '2.0.0',
      },
      {
        catalog: 'default',
        componentVersion: '1.9.7',
        name: 'kube-state-metrics',
        version: '1.3.1',
      },
      {
        catalog: 'default',
        componentVersion: '0.4.1',
        name: 'metrics-server',
        version: '1.3.0',
      },
      {
        catalog: 'default',
        name: 'net-exporter',
        version: '1.10.1',
      },
      {
        catalog: 'default',
        componentVersion: '1.0.1',
        name: 'node-exporter',
        version: '1.7.2',
      },
    ],
    components: [
      {
        catalog: 'control-plane-catalog',
        name: 'app-operator',
        releaseOperatorDeploy: false,
        version: '5.2.0',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'capa-aws-cni-operator',
        releaseOperatorDeploy: true,
        version: '0.1.1',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'capa-iam-operator',
        reference: '0.3.0',
        releaseOperatorDeploy: true,
        version: '0.3.0',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cluster-api-bootstrap-provider-kubeadm',
        releaseOperatorDeploy: true,
        version: '0.3.22-gs6',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cluster-api-control-plane',
        releaseOperatorDeploy: true,
        version: '0.3.22-gs9',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cluster-api-core',
        releaseOperatorDeploy: true,
        version: '0.3.22-gs4',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cluster-api-provider-aws',
        releaseOperatorDeploy: true,
        version: '0.6.8-gs8',
      },
      {
        catalog: 'control-plane-test-catalog',
        name: 'policies-common',
        releaseOperatorDeploy: true,
        version: '0.6.2',
      },
      {
        catalog: 'control-plane-test-catalog',
        name: 'policies-aws',
        releaseOperatorDeploy: true,
        version: '0.6.2',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'cluster-apps-operator',
        releaseOperatorDeploy: true,
        version: '0.6.1',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'kubernetes',
        version: '1.19.9',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'containerlinux',
        version: '2605.12.0',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'calico',
        version: '3.15.3',
      },
      {
        catalog: 'control-plane-catalog',
        name: 'etcd',
        version: '3.4.14',
      },
    ],
    date: '2021-05-31T14:50:41Z',
    state: 'preview',
    notice: '',
  },
  status: {
    inUse: true,
    ready: true,
  },
};

export const releasesList: releasev1alpha1.IReleaseList = {
  apiVersion: 'release.giantswarm.io/v1alpha1',
  kind: 'ReleaseList',
  metadata: {
    resourceVersion: '294659579',
    selfLink: '/apis/release.giantswarm.io/v1alpha1/releases/',
  },
  items: [v13_1_0, v14_0_1, v14_1_5, v15_0_0, v20_0_0_alpha],
};
