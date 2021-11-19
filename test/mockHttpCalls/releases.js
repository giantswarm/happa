export const disabledRelease = {
  active: false,
  changelog: [
    {
      component: 'cloudformation',
      description: 'Duplicate etcd record set into public hosted zone.',
    },
    {
      component: 'cloudformation',
      description: 'Add ingress internal load-balancer in private hosted zone.',
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
};

export const preNodePoolRelease = {
  active: true,
  changelog: [
    {
      component: 'cloudformation',
      description:
        'Use private subnets for internal Kubernetes API loadbalancer.',
    },
    {
      component: 'cloudformation',
      description: 'Add ingress internal load-balancer in private hosted zone.',
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
      name: 'cert-exporter',
      version: '1.2.3',
    },
    {
      name: 'net-exporter',
      version: '2.3.4',
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
};

export const nodePoolRelease = {
  active: true,
  changelog: [
    {
      component: 'cloudformation',
      description: 'Add IAMManager IAM role for kiam managed app.',
    },
    {
      component: 'cloudformation',
      description: 'Add Route53Manager IAM role for external-dns managed app.',
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
        'Add Node Pools functionality. See https://docs.giantswarm.io/advanced/node-pools/ for details.',
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
  version: '11.1.0',
};

export const nodePoolWithFlatcarRelease = {
  active: true,
  changelog: [
    {
      component: 'See release notes',
      description:
        'https://github.com/giantswarm/releases/blob/master/release-notes/aws/v11.3.0.md',
    },
  ],
  components: [
    {
      name: 'app-operator',
      version: '1.0.0',
    },
    {
      name: 'aws-cni',
      version: '1.6.0',
    },
    {
      name: 'aws-operator',
      version: '8.5.0',
    },
    {
      name: 'cert-operator',
      version: '0.1.0',
    },
    {
      name: 'cluster-operator',
      version: '2.1.10',
    },
    {
      name: 'kubernetes',
      version: '1.16.9',
    },
    {
      name: 'containerlinux',
      version: '2345.3.1',
    },
    {
      name: 'calico',
      version: '3.10.1',
    },
    {
      name: 'etcd',
      version: '3.3.17',
    },
    {
      name: 'cert-exporter',
      version: '1.2.1',
    },
    {
      name: 'cert-manager',
      version: '0.9.0',
    },
    {
      name: 'chart-operator',
      version: '0.12.4',
    },
    {
      name: 'cluster-autoscaler',
      version: '1.16.2',
    },
    {
      name: 'coredns',
      version: '1.6.5',
    },
    {
      name: 'external-dns',
      version: '0.5.18',
    },
    {
      name: 'kiam',
      version: '3.5.0',
    },
    {
      name: 'kube-state-metrics',
      version: '1.9.5',
    },
    {
      name: 'metrics-server',
      version: '0.3.3',
    },
    {
      name: 'net-exporter',
      version: '1.7.0',
    },
    {
      name: 'node-exporter',
      version: '0.18.1',
    },
  ],
  timestamp: '2020-05-11T15:00:00Z',
  version: '11.3.0',
};
// Just thre of them: a false release, a pre node pools release and a node pools release
// A releases response with four responses:
// - (A) a disabled one
// - (B) enabled pre node pools
// - (C) enabled node pools
// - (D) enabled with flatcar (containerlinux >= 2345.3.1)
export const releasesResponse = [
  // (A)
  disabledRelease,
  // (B)
  preNodePoolRelease,
  // (C)
  nodePoolRelease,
  // (D)
  nodePoolWithFlatcarRelease,
];
