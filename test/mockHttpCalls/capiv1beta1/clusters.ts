import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';

export const randomClusterAWS1: capiv1beta1.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: capiv1beta1.Cluster,
  metadata: {
    annotations: {
      'cluster.giantswarm.io/description': 'Random Cluster',
    },
    creationTimestamp: '2022-03-29T06:38:39Z',
    finalizers: [
      'encryption-provider-operator.finalizers.giantswarm.io',
      'operatorkit.giantswarm.io/cluster-operator-cluster-controller',
      'operatorkit.giantswarm.io/prometheus-meta-operator-cluster-api-controller',
    ],
    generation: 1,
    labels: {
      'cluster-operator.giantswarm.io/version': '3.13.0',
      'cluster.x-k8s.io/cluster-name': 'c7hm5',
      'giantswarm.io/cluster': 'c7hm5',
      'release.giantswarm.io/version': '17.0.3',
    },
    name: 'c7hm5',
    namespace: 'org-org1',
    resourceVersion: '540373278',
    selfLink:
      '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/c7hm5',
    uid: '7a2858d1-fbff-4337-b89f-e8b9dc41b113',
  },
  spec: {
    controlPlaneEndpoint: {
      host: 'api.c7hm5.k8s.test.gigantic.io',
      port: 443,
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
      kind: 'AWSCluster',
      name: 'c7hm5',
      namespace: 'org-org1',
    },
  },
  status: {
    infrastructureReady: false,
  },
};

export const randomClusterAWS2: capiv1beta1.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: capiv1beta1.Cluster,
  metadata: {
    annotations: {
      'cluster.giantswarm.io/description': 'Random Cluster',
    },
    creationTimestamp: '2022-03-29T06:38:39Z',
    finalizers: [
      'encryption-provider-operator.finalizers.giantswarm.io',
      'operatorkit.giantswarm.io/cluster-operator-cluster-controller',
      'operatorkit.giantswarm.io/prometheus-meta-operator-cluster-api-controller',
    ],
    generation: 1,
    labels: {
      'cluster-operator.giantswarm.io/version': '3.13.0',
      'cluster.x-k8s.io/cluster-name': 'as81f',
      'giantswarm.io/cluster': 'as81f',
      'release.giantswarm.io/version': '17.0.3',
    },
    name: 'as81f',
    namespace: 'org-org1',
    resourceVersion: '540373278',
    selfLink:
      '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/as81f',
    uid: '7a2858d1-fbff-4337-b89f-e8b9dc41b113',
  },
  spec: {
    controlPlaneEndpoint: {
      host: '',
      port: 0,
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
      kind: 'AWSCluster',
      name: 'as81f',
      namespace: 'org-org1',
    },
  },
  status: {
    infrastructureReady: false,
  },
};

export const randomClusterCAPA1: capiv1beta1.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'Cluster',
  metadata: {
    annotations: {
      'cluster.giantswarm.io/description': 'test capa cluster',
      'meta.helm.sh/release-name': 'asdf1',
      'meta.helm.sh/release-namespace': 'org-org1',
      'network-topology.giantswarm.io/mode': 'None',
    },
    creationTimestamp: '2022-09-29T09:14:00Z',
    finalizers: [],
    labels: {
      app: 'cluster-aws',
      'app.kubernetes.io/managed-by': 'Helm',
      'app.kubernetes.io/version': '0.9.2',
      'application.giantswarm.io/team': 'hydra',
      'cluster-apps-operator.giantswarm.io/watching': '',
      'cluster.x-k8s.io/cluster-name': 'asdf1',
      'cluster.x-k8s.io/watch-filter': 'capi',
      'giantswarm.io/cluster': 'asdf1',
      'giantswarm.io/organization': 'org1',
      'helm.sh/chart': 'cluster-aws-0.9.2',
      'release.giantswarm.io/version': '20.0.0-alpha1',
    },
    name: 'asdf1',
    namespace: 'org-org1',
  },
  spec: {
    controlPlaneEndpoint: {
      host: 'asdf1-apiserver-123412345.eu-west-2.elb.amazonaws.com',
      port: 6443,
    },
    controlPlaneRef: {
      apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
      kind: 'KubeadmControlPlane',
      name: 'asdf1',
      namespace: 'org-org1',
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
      kind: 'AWSCluster',
      name: 'asdf1',
      namespace: 'org-org1',
    },
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2022-09-29T09:22:07Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2022-09-29T09:19:19Z',
        status: 'True',
        type: 'ControlPlaneInitialized',
      },
      {
        lastTransitionTime: '2022-09-29T09:22:07Z',
        status: 'True',
        type: 'ControlPlaneReady',
      },
      {
        lastTransitionTime: '2022-09-29T09:17:04Z',
        status: 'True',
        type: 'InfrastructureReady',
      },
    ],
    controlPlaneReady: true,
    failureDomains: {
      'eu-west-2a': {
        controlPlane: true,
      },
      'eu-west-2b': {
        controlPlane: true,
      },
      'eu-west-2c': {
        controlPlane: true,
      },
    },
    infrastructureReady: true,
    phase: 'Provisioned',
  },
};

export const randomClusterCAPA2: capiv1beta1.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'Cluster',
  metadata: {
    annotations: {
      'cluster.giantswarm.io/description': 'another test capa cluster',
      'meta.helm.sh/release-name': 'fdsa1',
      'meta.helm.sh/release-namespace': 'org-org1',
    },
    creationTimestamp: '2022-09-28T09:15:00Z',
    finalizers: [],
    labels: {
      app: 'cluster-aws',
      'app.kubernetes.io/managed-by': 'Helm',
      'app.kubernetes.io/version': '0.9.3',
      'application.giantswarm.io/team': 'hydra',
      'cluster-apps-operator.giantswarm.io/watching': '',
      'cluster.x-k8s.io/cluster-name': 'fdsa1',
      'cluster.x-k8s.io/watch-filter': 'capi',
      'giantswarm.io/cluster': 'fdsa1',
      'giantswarm.io/organization': 'org1',
      'helm.sh/chart': 'cluster-aws-0.9.2',
      'release.giantswarm.io/version': '20.0.0-alpha1',
    },
    name: 'fdsa1',
    namespace: 'org-org1',
  },
  spec: {
    controlPlaneEndpoint: {
      host: 'fdsa1-apiserver-123412345.eu-west-2.elb.amazonaws.com',
      port: 6443,
    },
    controlPlaneRef: {
      apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
      kind: 'KubeadmControlPlane',
      name: 'fdsa1',
      namespace: 'org-org1',
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
      kind: 'AWSCluster',
      name: 'fdsa1',
      namespace: 'org-org1',
    },
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2022-09-28T09:20:00Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2022-09-28T09:19:00Z',
        status: 'True',
        type: 'ControlPlaneInitialized',
      },
      {
        lastTransitionTime: '2022-09-28T09:22:00Z',
        status: 'True',
        type: 'ControlPlaneReady',
      },
      {
        lastTransitionTime: '2022-09-28T00:17:00Z',
        status: 'True',
        type: 'InfrastructureReady',
      },
    ],
    controlPlaneReady: true,
    failureDomains: {
      'eu-west-2a': {
        controlPlane: true,
      },
      'eu-west-2b': {
        controlPlane: true,
      },
      'eu-west-2c': {
        controlPlane: true,
      },
    },
    infrastructureReady: true,
    phase: 'Provisioned',
  },
};

export const randomClusterGCP1: capiv1beta1.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'Cluster',
  metadata: {
    annotations: {
      'cluster.giantswarm.io/description': 'Random GCP Cluster',
      'meta.helm.sh/release-name': 'm317f',
      'meta.helm.sh/release-namespace': 'org-org1',
    },
    creationTimestamp: '2022-07-12T06:20:25Z',
    finalizers: [
      'cluster.cluster.x-k8s.io',
      'operatorkit.giantswarm.io/prometheus-meta-operator-cluster-api-controller',
      'encryption-provider-operator.finalizers.giantswarm.io',
      'operatorkit.giantswarm.io/cluster-apps-operator-cluster-controller',
    ],
    generation: 2,
    labels: {
      app: 'cluster-gcp',
      'app.kubernetes.io/managed-by': 'Helm',
      'app.kubernetes.io/version': '0.15.1',
      'application.giantswarm.io/team': 'phoenix',
      'cluster-apps-operator.giantswarm.io/watching': '',
      'cluster.x-k8s.io/cluster-name': 'm317f',
      'giantswarm.io/cluster': 'm317f',
      'helm.sh/chart': 'cluster-gcp-0.15.1',
    },
    name: 'm317f',
    namespace: 'org-org1',
    resourceVersion: '14262849',
    uid: '7a2858d1-fbff-4337-b89f-e8b9dc41b113',
  },
  spec: {
    clusterNetwork: {
      pods: {
        cidrBlocks: ['192.168.0.0/16'],
      },
    },
    controlPlaneEndpoint: {
      host: '192.168.0.0',
      port: 0,
    },
    controlPlaneRef: {
      apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
      kind: 'KubeadmControlPlane',
      name: 'm317f',
      namespace: 'org-org1',
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
      kind: 'GCPCluster',
      name: 'm317f',
      namespace: 'org-org1',
    },
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2022-07-12T06:28:55Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2022-07-12T06:25:00Z',
        status: 'True',
        type: 'ControlPlaneInitialized',
      },
      {
        lastTransitionTime: '2022-07-12T06:28:55Z',
        status: 'True',
        type: 'ControlPlaneReady',
      },
      {
        lastTransitionTime: '2022-07-12T06:21:25Z',
        status: 'True',
        type: 'InfrastructureReady',
      },
    ],
    controlPlaneReady: true,
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
    infrastructureReady: true,
    observedGeneration: 2,
    phase: 'Provisioned',
  },
};

export const randomClusterGCP2: capiv1beta1.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'Cluster',
  metadata: {
    annotations: {
      'cluster.giantswarm.io/description': 'Random GCP Cluster',
      'meta.helm.sh/release-name': 'g9h9j',
      'meta.helm.sh/release-namespace': 'org-org1',
    },
    creationTimestamp: '2022-07-13T06:20:25Z',
    finalizers: [
      'cluster.cluster.x-k8s.io',
      'operatorkit.giantswarm.io/prometheus-meta-operator-cluster-api-controller',
      'encryption-provider-operator.finalizers.giantswarm.io',
      'operatorkit.giantswarm.io/cluster-apps-operator-cluster-controller',
    ],
    generation: 2,
    labels: {
      app: 'cluster-gcp',
      'app.kubernetes.io/managed-by': 'Helm',
      'app.kubernetes.io/version': '0.15.2',
      'application.giantswarm.io/team': 'phoenix',
      'cluster-apps-operator.giantswarm.io/watching': '',
      'cluster.x-k8s.io/cluster-name': 'g9h9j',
      'giantswarm.io/cluster': 'g9h9j',
      'helm.sh/chart': 'cluster-gcp-0.15.1',
    },
    name: 'g9h9j',
    namespace: 'org-org1',
    resourceVersion: '14262849',
    uid: '7a2858d1-fbff-4337-b89f-e8b9dc41b113',
  },
  spec: {
    clusterNetwork: {
      pods: {
        cidrBlocks: ['192.168.0.0/16'],
      },
    },
    controlPlaneEndpoint: {
      host: 'test.k8s.gs.com',
      port: 0,
    },
    controlPlaneRef: {
      apiVersion: 'controlplane.cluster.x-k8s.io/v1beta1',
      kind: 'KubeadmControlPlane',
      name: 'g9h9j',
      namespace: 'org-org1',
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
      kind: 'GCPCluster',
      name: 'g9h9j',
      namespace: 'org-org1',
    },
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2022-07-13T06:28:55Z',
        status: 'True',
        type: 'Ready',
      },
      {
        lastTransitionTime: '2022-07-13T06:25:00Z',
        status: 'True',
        type: 'ControlPlaneInitialized',
      },
      {
        lastTransitionTime: '2022-07-13T06:28:55Z',
        status: 'True',
        type: 'ControlPlaneReady',
      },
      {
        lastTransitionTime: '2022-07-13T06:21:25Z',
        status: 'True',
        type: 'InfrastructureReady',
      },
    ],
    controlPlaneReady: true,
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
    infrastructureReady: true,
    observedGeneration: 2,
    phase: 'Provisioned',
  },
};

export const randomCluster1: capiv1beta1.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: capiv1beta1.Cluster,
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
      'release.giantswarm.io/version': '14.1.5',
    },
    name: 'j5y9m',
    namespace: 'org-org1',
    resourceVersion: '294578552',
    selfLink:
      '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/j5y9m',
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
      host: 'api.j5y9m.k8s.test.gigantic.io',
      port: 443,
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
      kind: 'AzureCluster',
      name: 'j5y9m',
      namespace: 'org-org1',
      resourceVersion: '294571809',
      uid: 'a2bfb553-88ed-4ead-a0ed-d9f8cec546bb',
    },
  },
  status: {
    controlPlaneReady: true,
    infrastructureReady: false,
    conditions: [],
  },
};

export const randomCluster2: capiv1beta1.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: capiv1beta1.Cluster,
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
      'release.giantswarm.io/version': '14.0.1',
    },
    name: 'as43z',
    namespace: 'org-org1',
    resourceVersion: '294578552',
    selfLink:
      '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/as43z',
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
      host: 'test.k8s.gs.com',
      port: 0,
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
      kind: 'AzureCluster',
      name: 'as43z',
      namespace: 'org-org1',
      resourceVersion: '294571809',
      uid: 'a2bfb553-88ed-4ead-a0ed-d9f8cec546bb',
    },
  },
  status: {
    controlPlaneReady: true,
    infrastructureReady: false,
  },
};

// uses Azure release v17.1.0
export const randomCluster3: capiv1beta1.ICluster = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: capiv1beta1.Cluster,
  metadata: {
    annotations: {
      'cluster.giantswarm.io/description': 'Random Cluster 3',
    },
    creationTimestamp: '2020-12-01T08:41:06Z',
    finalizers: ['operatorkit.giantswarm.io/azure-operator-cluster-controller'],
    generation: 4,
    labels: {
      'azure-operator.giantswarm.io/version': '5.20.0',
      'cluster-operator.giantswarm.io/version': '3.12.0',
      'cluster.x-k8s.io/cluster-name': '0fa12',
      'giantswarm.io/cluster': '0fa12',
      'release.giantswarm.io/version': '17.1.0',
    },
    name: '0fa12',
    namespace: 'org-org1',
    resourceVersion: '294578552',
    selfLink:
      '/apis/cluster.x-k8s.io/v1beta1/namespaces/org-org1/clusters/0fa12',
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
      host: 'test.k8s.gs.com',
      port: 0,
    },
    infrastructureRef: {
      apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
      kind: 'AzureCluster',
      name: '0fa12',
      namespace: 'org-org1',
      resourceVersion: '294571809',
      uid: 'a2bfb553-88ed-4ead-a0ed-d9f8cec546bb',
    },
  },
  status: {
    controlPlaneReady: true,
    infrastructureReady: false,
  },
};

export const randomClusterList: capiv1beta1.IClusterList = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'ClusterList',
  metadata: {
    resourceVersion: '294659579',
    selfLink: '/apis/cluster.x-k8s.io/v1beta1/clusters/',
  },
  items: [randomCluster1, randomCluster2, randomCluster3],
};

export const randomClusterListAWS: capiv1beta1.IClusterList = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'ClusterList',
  metadata: {
    resourceVersion: '294659579',
    selfLink: '/apis/cluster.x-k8s.io/v1beta1/clusters/',
  },
  items: [randomClusterAWS1, randomClusterAWS2],
};

export const randomClusterListCAPA: capiv1beta1.IClusterList = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'ClusterList',
  metadata: {
    selfLink: '/apis/cluster.x-k8s.io/v1beta1/clusters/',
  },
  items: [randomClusterCAPA1, randomClusterCAPA2],
};

export const randomClusterListGCP: capiv1beta1.IClusterList = {
  apiVersion: 'cluster.x-k8s.io/v1beta1',
  kind: 'ClusterList',
  metadata: {
    resourceVersion: '294659579',
    selfLink: '/apis/cluster.x-k8s.io/v1beta1/clusters/',
  },
  items: [randomClusterGCP1, randomClusterGCP2],
};
