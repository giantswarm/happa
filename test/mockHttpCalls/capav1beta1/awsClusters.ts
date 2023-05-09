import * as capav1beta1 from 'model/services/mapi/capav1beta1';

export const randomAWSCluster1: capav1beta1.IAWSCluster = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: 'AWSCluster',
  metadata: {
    annotations: {
      'aws.giantswarm.io/dns-assign-additional-vpc': '',
      'aws.giantswarm.io/dns-mode': 'private',
      'meta.helm.sh/release-name': 'asdf1',
      'meta.helm.sh/release-namespace': 'org-org1',
    },
    creationTimestamp: '2022-09-29T09:14:00Z',
    finalizers: [],
    labels: {
      app: 'cluster-aws',
      'app.kubernetes.io/managed-by': 'Helm',
      'app.kubernetes.io/version': '0.9.2',
      'application.giantswarm.io/team': 'hydra',
      'cluster.x-k8s.io/cluster-name': 'asdf1',
      'cluster.x-k8s.io/watch-filter': 'capi',
      'giantswarm.io/cluster': 'asdf1',
      'giantswarm.io/organization': 'giantswarm',
      'helm.sh/chart': 'cluster-aws-0.9.2',
    },
    name: 'asdf1',
    namespace: 'org-org1',
    ownerReferences: [
      {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        blockOwnerDeletion: true,
        controller: true,
        kind: 'Cluster',
        name: 'asdf1',
        uid: '',
      },
    ],
  },
  spec: {
    controlPlaneEndpoint: {
      host: 'asdf1-apiserver-123412345.eu-west-2.elb.amazonaws.com',
      port: 6443,
    },
    controlPlaneLoadBalancer: {
      crossZoneLoadBalancing: false,
      scheme: 'internet-facing',
    },
    identityRef: {
      kind: 'AWSClusterRoleIdentity',
      name: 'default',
    },
    region: 'eu-west-2',
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2022-09-29T09:14:00Z',
        status: 'True',
        type: 'Ready',
      },
    ],
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
    ready: true,
  },
};

export const randomAWSCluster2: capav1beta1.IAWSCluster = {
  apiVersion: 'infrastructure.cluster.x-k8s.io/v1beta1',
  kind: 'AWSCluster',
  metadata: {
    annotations: {
      'aws.giantswarm.io/dns-assign-additional-vpc': '',
      'aws.giantswarm.io/dns-mode': 'private',
      'meta.helm.sh/release-name': 'fdsa1',
      'meta.helm.sh/release-namespace': 'org-org1',
    },
    creationTimestamp: '2022-09-28T09:15:00Z',
    finalizers: [],
    labels: {
      app: 'cluster-aws',
      'app.kubernetes.io/managed-by': 'Helm',
      'app.kubernetes.io/version': '0.9.2',
      'application.giantswarm.io/team': 'hydra',
      'cluster.x-k8s.io/cluster-name': 'fdsa1',
      'cluster.x-k8s.io/watch-filter': 'capi',
      'giantswarm.io/cluster': 'fdsa1',
      'giantswarm.io/organization': 'giantswarm',
      'helm.sh/chart': 'cluster-aws-0.9.2',
    },
    name: 'fdsa1',
    namespace: 'org-org1',
    ownerReferences: [
      {
        apiVersion: 'cluster.x-k8s.io/v1beta1',
        blockOwnerDeletion: true,
        controller: true,
        kind: 'Cluster',
        name: 'fdsa1',
        uid: '',
      },
    ],
  },
  spec: {
    controlPlaneEndpoint: {
      host: 'fdsa1-apiserver-123412345.eu-west-2.elb.amazonaws.com',
      port: 6443,
    },
    controlPlaneLoadBalancer: {
      crossZoneLoadBalancing: false,
      scheme: 'internet-facing',
    },
    identityRef: {
      kind: 'AWSClusterRoleIdentity',
      name: 'default',
    },
    region: 'eu-west-2',
  },
  status: {
    conditions: [
      {
        lastTransitionTime: '2022-09-28T09:15:00Z',
        status: 'True',
        type: 'Ready',
      },
    ],
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
    ready: true,
  },
};
