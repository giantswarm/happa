import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';

export const randomAWSCluster1: infrav1alpha3.IAWSCluster = {
  apiVersion: 'infrastructure.giantswarm.io/v1alpha3',
  kind: 'AWSCluster',
  metadata: {
    creationTimestamp: '2022-03-29T06:38:38Z',
    generation: 1,
    labels: {
      'aws-operator.giantswarm.io/version': '10.18.0',
      'cluster.x-k8s.io/cluster-name': 'c7hm5',
      'giantswarm.io/cluster': 'c7hm5',
      'giantswarm.io/organization': 'org1',
      'release.giantswarm.io/version': '17.0.3',
    },
    name: 'c7hm5',
    namespace: 'org-org1',
    resourceVersion: '540376281',
    selfLink:
      '/apis/infrastructure.giantswarm.io/v1alpha3/namespaces/org-org1/awsclusters/c7hm5',
    uid: 'bc8a1afc-1aee-4ec4-879d-efbb45bc065b',
  },
  spec: {
    cluster: {
      description: 'Random Cluster',
      dns: {
        domain: 'ginger.eu-west-1.aws.gigantic.io',
      },
      kubeProxy: {
        conntrackMaxPerCore: 0,
      },
      oidc: {
        claims: {
          groups: '',
          username: '',
        },
        clientID: '',
        issuerURL: '',
      },
    },
    provider: {
      credentialSecret: {
        name: 'credential-default',
        namespace: 'giantswarm',
      },
      master: {
        availabilityZone: '',
        instanceType: '',
      },
      nodes: {
        networkPool: '',
      },
      pods: {
        cidrBlock: '172.18.128.0/18',
        externalSNAT: false,
      },
      region: 'eu-west-1',
    },
  },
  status: {
    cluster: {
      conditions: [
        {
          condition: 'Creating',
          lastTransitionTime: '2022-03-29T06:40:52Z',
        },
      ],
      id: 'c7hm5',
    },
    provider: {
      network: {},
    },
  },
};
