import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';

export const randomCluster1: capiv1alpha3.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1alpha3',
  kind: capiv1alpha3.Cluster,
  metadata: {
    annotations: {
      'cluster.giantswarm.io/description': 'Random Cluster',
    },
    creationTimestamp: '2021-04-27T10:46:06Z',
    finalizers: ['operatorkit.giantswarm.io/azure-operator-cluster-controller'],
    generation: 4,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.2',
      'cluster-operator.giantswarm.io/version': '0.23.22',
      'cluster.x-k8s.io/cluster-name': 'j5y9m',
      'giantswarm.io/cluster': 'j5y9m',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '14.1.5',
    },
    name: 'j5y9m',
    namespace: 'org-org1',
    resourceVersion: '294578552',
    selfLink:
      '/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/j5y9m',
    uid: '2d448421-8735-4964-929b-2adce693d874',
  },
  spec: {
    clusterNetwork: {
      apiServerPort: 443,
      serviceDomain: 'cluster.local',
      services: {
        cidrBlocks: ['172.31.0.0/16'],
      },
    },
    controlPlaneEndpoint: {
      host: '',
      port: 0,
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
      kind: 'AzureCluster',
      name: 'j5y9m',
      namespace: 'org-org1',
      resourceVersion: '294571809',
      uid: 'a2bfb553-88ed-4ead-a0ed-d9f8cec546bb',
    },
  },
  status: {
    controlPlaneInitialized: true,
    infrastructureReady: false,
  },
};

export const randomCluster2: capiv1alpha3.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1alpha3',
  kind: capiv1alpha3.Cluster,
  metadata: {
    annotations: {
      'cluster.giantswarm.io/description': 'Random Cluster 2',
    },
    creationTimestamp: '2021-02-27T08:41:06Z',
    finalizers: ['operatorkit.giantswarm.io/azure-operator-cluster-controller'],
    generation: 4,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.2',
      'cluster-operator.giantswarm.io/version': '0.23.22',
      'cluster.x-k8s.io/cluster-name': 'as43z',
      'giantswarm.io/cluster': 'as43z',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '14.0.1',
    },
    name: 'as43z',
    namespace: 'org-org1',
    resourceVersion: '294578552',
    selfLink:
      '/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/as43z',
    uid: '2d448421-8735-4964-929b-2adce693d874',
  },
  spec: {
    clusterNetwork: {
      apiServerPort: 443,
      serviceDomain: 'cluster.local',
      services: {
        cidrBlocks: ['172.31.0.0/16'],
      },
    },
    controlPlaneEndpoint: {
      host: '',
      port: 0,
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
      kind: 'AzureCluster',
      name: 'as43z',
      namespace: 'org-org1',
      resourceVersion: '294571809',
      uid: 'a2bfb553-88ed-4ead-a0ed-d9f8cec546bb',
    },
  },
  status: {
    controlPlaneInitialized: true,
    infrastructureReady: false,
  },
};

export const randomCluster3: capiv1alpha3.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1alpha3',
  kind: capiv1alpha3.Cluster,
  metadata: {
    annotations: {
      'cluster.giantswarm.io/description': 'Random Cluster 3',
    },
    creationTimestamp: '2020-12-01T08:41:06Z',
    finalizers: ['operatorkit.giantswarm.io/azure-operator-cluster-controller'],
    generation: 4,
    labels: {
      'azure-operator.giantswarm.io/version': '5.5.2',
      'cluster-operator.giantswarm.io/version': '0.23.22',
      'cluster.x-k8s.io/cluster-name': '0fa12',
      'giantswarm.io/cluster': '0fa12',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '13.1.0',
    },
    name: '0fa12',
    namespace: 'org-org1',
    resourceVersion: '294578552',
    selfLink:
      '/apis/cluster.x-k8s.io/v1alpha3/namespaces/org-org1/clusters/0fa12',
    uid: '2d448421-8735-4964-929b-2adce693d874',
  },
  spec: {
    clusterNetwork: {
      apiServerPort: 443,
      serviceDomain: 'cluster.local',
      services: {
        cidrBlocks: ['172.31.0.0/16'],
      },
    },
    controlPlaneEndpoint: {
      host: '',
      port: 0,
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1alpha3',
      kind: 'AzureCluster',
      name: '0fa12',
      namespace: 'org-org1',
      resourceVersion: '294571809',
      uid: 'a2bfb553-88ed-4ead-a0ed-d9f8cec546bb',
    },
  },
  status: {
    controlPlaneInitialized: true,
    infrastructureReady: false,
  },
};

export const randomClusterList: capiv1alpha3.IClusterList = {
  apiVersion: 'cluster.x-k8s.io/v1alpha3',
  kind: 'ClusterList',
  metadata: {
    resourceVersion: '294659579',
    selfLink: '/apis/cluster.x-k8s.io/v1alpha3/clusters/',
  },
  items: [randomCluster1, randomCluster2, randomCluster3],
};
