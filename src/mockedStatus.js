import { Providers } from 'model/constants';

const mockedStatus = {
  aws: {
    availabilityZones: [
      {
        name: 'eu-central-1c',
        subnet: {
          private: {
            cidr: '10.1.6.0/25',
          },
          public: {
            cidr: '10.1.6.128/25',
          },
        },
      },
    ],
    autoScalingGroup: {
      name: '',
    },
  },
  cluster: {
    conditions: [
      {
        lastTransitionTime: '2019-08-14T08:21:16.184111Z',
        status: 'True',
        type: 'Created',
      },
    ],
    network: {
      cidr: '10.1.6.0/24',
    },
    nodes: [
      {
        labels: {
          'aws-operator.giantswarm.io/version': '5.2.0',
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': 'm4.xlarge',
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'eu-central-1',
          'failure-domain.beta.kubernetes.io/zone': 'eu-central-1c',
          'giantswarm.io/provider': Providers.AWS,
          ip: '10.1.6.23',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'ip-10-1-6-23.eu-central-1.compute.internal',
          'kubernetes.io/os': 'linux',
          'kubernetes.io/role': 'worker',
          'node-role.kubernetes.io/worker': '',
          'node.kubernetes.io/worker': '',
          role: 'worker',
        },
        lastTransitionTime: '2019-08-14T08:16:11.056559891Z',
        name: 'ip-10-1-6-23.eu-central-1.compute.internal',
        version: '5.2.0',
      },
      {
        labels: {
          'aws-operator.giantswarm.io/version': '5.2.0',
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': 'm4.large',
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'eu-central-1',
          'failure-domain.beta.kubernetes.io/zone': 'eu-central-1c',
          'giantswarm.io/provider': Providers.AWS,
          ip: '10.1.6.28',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'ip-10-1-6-28.eu-central-1.compute.internal',
          'kubernetes.io/os': 'linux',
          'kubernetes.io/role': 'master',
          'node-role.kubernetes.io/master': '',
          'node.kubernetes.io/master': '',
          role: 'master',
        },
        lastTransitionTime: '2019-08-14T08:16:11.056560535Z',
        name: 'ip-10-1-6-28.eu-central-1.compute.internal',
        version: '5.2.0',
      },
      {
        labels: {
          'aws-operator.giantswarm.io/version': '5.2.0',
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': 'm4.xlarge',
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'eu-central-1',
          'failure-domain.beta.kubernetes.io/zone': 'eu-central-1c',
          'giantswarm.io/provider': Providers.AWS,
          ip: '10.1.6.39',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'ip-10-1-6-39.eu-central-1.compute.internal',
          'kubernetes.io/os': 'linux',
          'kubernetes.io/role': 'worker',
          'node-role.kubernetes.io/worker': '',
          'node.kubernetes.io/worker': '',
          role: 'worker',
        },
        lastTransitionTime: '2019-08-14T08:16:11.056560916Z',
        name: 'ip-10-1-6-39.eu-central-1.compute.internal',
        version: '5.2.0',
      },
      {
        labels: {
          'aws-operator.giantswarm.io/version': '5.2.0',
          'beta.kubernetes.io/arch': 'amd64',
          'beta.kubernetes.io/instance-type': 'm4.xlarge',
          'beta.kubernetes.io/os': 'linux',
          'failure-domain.beta.kubernetes.io/region': 'eu-central-1',
          'failure-domain.beta.kubernetes.io/zone': 'eu-central-1c',
          'giantswarm.io/provider': Providers.AWS,
          ip: '10.1.6.91',
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname':
            'ip-10-1-6-91.eu-central-1.compute.internal',
          'kubernetes.io/os': 'linux',
          'kubernetes.io/role': 'worker',
          'node-role.kubernetes.io/worker': '',
          'node.kubernetes.io/worker': '',
          role: 'worker',
        },
        lastTransitionTime: '2019-08-14T08:16:11.056561365Z',
        name: 'ip-10-1-6-91.eu-central-1.compute.internal',
        version: '5.2.0',
      },
    ],
    resources: null,
    scaling: {
      desiredCapacity: 3,
    },
    versions: [
      {
        date: '0001-01-01T00:00:00Z',
        lastTransitionTime: '2019-08-14T08:21:18.613750139Z',
        semver: '5.2.0',
      },
    ],
  },
  lastUpdated: 1565789779948,
};

export default mockedStatus;
