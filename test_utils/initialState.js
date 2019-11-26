import * as Providers from 'shared/constants';

const initialState = function() {
  return {
    app: {
      firstLoadComplete: true,
      selectedOrganization: 'acme',
      loggedInUser: {
        email: 'oriol@giantswarm.io',
        auth: {
          scheme: 'Bearer',
          token: 'a-valid-token',
        },
        isAdmin: true,
      },
      info: {
        general: {
          installation_name: 'local',
          provider: Providers.AWS,
          availability_zones: {
            max: 3,
            default: 1,
          },
        },
        stats: {
          cluster_creation_duration: {
            median: 805,
            p25: 657,
            p75: 1031,
          },
        },
        workers: {
          count_per_cluster: {
            max: null,
            default: 3,
          },
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
            ],
            default: 'm3.large',
          },
        },
      },
    },
    entities: {
      credentials: { isFetching: false, lastUpdated: Date.now(), items: [] },
      clusters: {
        items: {
          '63xja': {
            id: '63xja',
            create_date: '2019-09-16T07:54:05Z',
            name: 'My cluster',
            owner: 'acme',
            release_version: '8.2.0',
            path: '/v4/clusters/63xja/',
            capabilities: {
              canInstallApps: true,
            },
            lastUpdated: 1568733549261,
            nodes: [],
            keyPairs: [],
            scaling: {
              min: 3,
              max: 3,
            },
            api_endpoint: 'https://api.63xja.g8s.fra-1.giantswarm.io',
            credential_id: '',
            workers: [
              {
                aws: {
                  instance_type: 'm3.large',
                },
                memory: {
                  size_gb: 7.5,
                },
                storage: {
                  size_gb: 32,
                },
                cpu: {
                  cores: 2,
                },
                labels: {},
              },
              {
                aws: {
                  instance_type: 'm3.large',
                },
                memory: {
                  size_gb: 7.5,
                },
                storage: {
                  size_gb: 32,
                },
                cpu: {
                  cores: 2,
                },
                labels: {},
              },
              {
                aws: {
                  instance_type: 'm3.large',
                },
                memory: {
                  size_gb: 7.5,
                },
                storage: {
                  size_gb: 32,
                },
                cpu: {
                  cores: 2,
                },
                labels: {},
              },
            ],
          },
          zu6w0: {
            id: 'zu6w0',
            create_date: '2019-09-06T11:56:51Z',
            name: 'Msae fsd  s r fg',
            owner: 'acme',
            release_version: '8.2.0',
            path: '/v4/clusters/zu6w0/',
            capabilities: {
              canInstallApps: true,
            },
            lastUpdated: 1568733549261,
            nodes: [],
            keyPairs: [],
            scaling: {
              min: 3,
              max: 3,
            },
            api_endpoint: 'https://api.zu6w0.g8s.fra-1.giantswarm.io',
            credential_id: '',
            workers: [
              {
                aws: {
                  instance_type: 'm3.large',
                },
                memory: {
                  size_gb: 7.5,
                },
                storage: {
                  size_gb: 32,
                },
                cpu: {
                  cores: 2,
                },
                labels: {},
              },
              {
                aws: {
                  instance_type: 'm3.large',
                },
                memory: {
                  size_gb: 7.5,
                },
                storage: {
                  size_gb: 32,
                },
                cpu: {
                  cores: 2,
                },
                labels: {},
              },
              {
                aws: {
                  instance_type: 'm3.large',
                },
                memory: {
                  size_gb: 7.5,
                },
                storage: {
                  size_gb: 32,
                },
                cpu: {
                  cores: 2,
                },
                labels: {},
              },
            ],
          },
          m0ckd: {
            id: 'm0ckd',
            api_endpoint: 'https://api.k8s.7g4di.example.com',
            create_date: '2019-06-01T23:43:18Z',
            owner: 'acme',
            name: 'All purpose cluster',
            credential_id: '',
            release_version: '8.0.0',
            master: {
              availability_zone: 'europe-west-1c',
            },
            conditions: [
              {
                last_transition_time: '2019-06-01T23:43:18Z',
                condition: 'Created',
              },
              {
                last_transition_time: '2019-06-01T22:37:18Z',
                condition: 'Creating',
              },
            ],
            versions: [
              {
                last_transition_time: '2019-06-01T23:43:18Z',
                version: '8.0.0',
              },
            ],
            lastUpdated: 1568733549309,
            nodes: [],
            keyPairs: [],
            scaling: {},
            nodePools: ['a0sdi', 'a1sdi', 'a2sdi'],
          },
        },
        nodePoolsClusters: ['m0ckd'],
      },
      organizations: {
        isFetching: false,
        items: {
          acme: {
            id: 'acme',
            members: [],
          },
        },
      },
      nodePools: {
        items: {
          a0sdi: {
            id: 'a0sdi',
            name: 'awesome-nodepool-0',
            availability_zones: ['europe-west-1a', 'europe-west-1b'],
            scaling: {
              min: 3,
              max: 5,
            },
            node_spec: {
              aws: {
                instance_type: 'm3.xlarge',
              },
              labels: ['beta-app'],
              volume_sizes: {
                docker: 100,
                kubelet: 100,
              },
            },
            status: {
              nodes: 4,
              nodes_ready: 4,
            },
            subnet: '10.0.0.0/24',
          },
          a1sdi: {
            id: 'a1sdi',
            name: 'awesome-nodepool-1',
            availability_zones: ['europe-west-1a', 'europe-west-1b'],
            scaling: {
              min: 3,
              max: 5,
            },
            node_spec: {
              aws: {
                instance_type: 'm3.xlarge',
              },
              labels: ['beta-app'],
              volume_sizes: {
                docker: 100,
                kubelet: 100,
              },
            },
            status: {
              nodes: 4,
              nodes_ready: 4,
            },
            subnet: '10.1.0.0/24',
          },
          a2sdi: {
            id: 'a2sdi',
            name: 'awesome-nodepool-2',
            availability_zones: ['europe-west-1a', 'europe-west-1b'],
            scaling: {
              min: 3,
              max: 5,
            },
            node_spec: {
              aws: {
                instance_type: 'm3.xlarge',
              },
              labels: ['beta-app'],
              volume_sizes: {
                docker: 100,
                kubelet: 100,
              },
            },
            status: {
              nodes: 4,
              nodes_ready: 4,
            },
            subnet: '10.2.0.0/24',
          },
        },
      },
      releases: {
        items: {
          '7.3.0': {
            version: '7.3.0',
            timestamp: '2019-04-17T08:00:00Z',
            changelog: [],
            components: [],
            active: false,
          },
          '7.3.1': {
            version: '7.3.1',
            timestamp: '2019-04-25T18:00:00Z',
            changelog: [],
            components: [],
            active: true,
          },
          '8.0.0': {
            version: '8.0.0',
            timestamp: '2019-04-17T08:00:00Z',
            changelog: [],
            components: [],
            active: false,
          },
          '8.1.0': {
            version: '8.1.0',
            timestamp: '2019-06-04T16:00:00Z',
            changelog: [],
            components: [],
            active: false,
          },
          '8.2.0': {
            version: '8.2.0',
            timestamp: '2019-06-03T10:00:00Z',
            changelog: [],
            components: [],
            active: true,
          },
          '8.3.0': {
            version: '8.3.0',
            timestamp: '2019-07-09T10:00:00Z',
            changelog: [],
            components: [],
            active: false,
          },
        },
      },
    },
  };
};

export default initialState;
