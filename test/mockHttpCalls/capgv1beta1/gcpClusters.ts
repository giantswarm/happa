import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';

export const randomGCPCluster1: capgv1beta1.IGCPCluster = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: 'GCPCluster',
  metadata: {
    creationTimestamp: '2022-07-12T06:20:25Z',
    finalizers: [
      'gcpcluster.infrastructure.cluster.x-k8s.io',
      'dns-operator-gcp.finalizers.giantswarm.io',
      'capg-firewall-rule-operator.finalizers.giantswarm.io',
    ],
    generation: 2,
    labels: {
      app: 'cluster-gcp',
      'app.kubernetes.io/version': '0.15.1',
      'cluster.x-k8s.io/cluster-name': 'm317f',
      'giantswarm.io/cluster': 'm317f',
      'giantswarm.io/organization': 'org1',
    },
    name: 'm317f',
    namespace: 'org-org1',
    resourceVersion: '14261279',
    uid: 'da40369d-8bca-4ad0-a975-77702f5933f8',
  },
  spec: {
    controlPlaneEndpoint: {
      host: '34.160.149.38',
      port: 443,
    },
    failureDomains: ['europe-west3-a', 'europe-west3-b', 'europe-west3-c'],
    project: 'project-352614',
    region: 'europe-west3',
  },
  status: {
    failureDomains: {
      'europe-west3-a': {
        controlPlane: true,
      },
      'europe-west3-b': {
        controlPlane: true,
      },
      'europe-west3-c': {
        controlPlane: true,
      },
    },
    ready: true,
  },
};

export const randomGCPCluster2: capgv1beta1.IGCPCluster = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: 'GCPCluster',
  metadata: {
    creationTimestamp: '2022-07-13T06:20:25Z',
    finalizers: [
      'gcpcluster.infrastructure.cluster.x-k8s.io',
      'dns-operator-gcp.finalizers.giantswarm.io',
      'capg-firewall-rule-operator.finalizers.giantswarm.io',
    ],
    generation: 2,
    labels: {
      app: 'cluster-gcp',
      'app.kubernetes.io/version': '0.15.1',
      'cluster.x-k8s.io/cluster-name': 'g9h9j',
      'giantswarm.io/cluster': 'g9h9j',
      'giantswarm.io/organization': 'org1',
    },
    name: 'g9h9j',
    namespace: 'org-org1',
    resourceVersion: '16036110',
    uid: 'c4e4ebc1-aa9f-44a2-b806-209f722938b5',
  },
  spec: {
    controlPlaneEndpoint: {
      host: '34.160.95.73',
      port: 443,
    },
    failureDomains: ['europe-west3-a', 'europe-west3-b', 'europe-west3-c'],
    project: 'project-352614',
    region: 'europe-west3',
  },
  status: {
    failureDomains: {
      'europe-west3-a': {
        controlPlane: true,
      },
      'europe-west3-b': {
        controlPlane: true,
      },
      'europe-west3-c': {
        controlPlane: true,
      },
    },
    ready: true,
  },
};
