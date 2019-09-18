// import configureStore from 'stores/configureStore';
// import mockedNodePool from './mocked_node_pool';

const initialState = {
  app: {
    firstLoadComplete: true,
    selectedOrganization: 'acme',
    loggedInUser: {
      email: 'oriol@giantswarm.io',
      auth: {
        scheme: 'Bearer',
        token:
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9VUTBNakExTlRFM01EQkVNalUxTUVNNU1UazFRelk1UWtJM1FUQTVSamhFTURjNE9EaEZRUSJ9.eyJodHRwczovL2dpYW50c3dhcm0uaW8vZ3JvdXBzIjoiYXBpLWFkbWluIiwiaHR0cHM6Ly9naWFudHN3YXJtLmlvL2VtYWlsIjoib3Jpb2xAZ2lhbnRzd2FybS5pbyIsImlzcyI6Imh0dHBzOi8vZ2lhbnRzd2FybS5ldS5hdXRoMC5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDA2MzExODEzMTU0NTA1MzY0NTEiLCJhdWQiOlsiaHR0cDovL2xvY2FsaG9zdDo4MDAwIiwiaHR0cHM6Ly9naWFudHN3YXJtLmV1LmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE1Njc2OTk4NDUsImV4cCI6MTU2NzY5OTkwNSwiYXpwIjoibWdZZHhDR0NaMmVhbzBPSlVHT0ZYdXJHSWFRQUFDSHMiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIn0.NFjA4vy_MHpvoZuvXNWy-yKBi_YUrwa7vVwVfJfl8D-xwnowa-uOM2zfoDlhQ4u4NaTiVlAx8E5LKVeRASCeAjLh_ncAGOLcMI0BL1tKg3WMZhc4mueNLZX0I61D-mqgqMgyzDLhOm5aGPXkJMjZg-Oz9fkR2VtGiTdt3ztAt5OqqyHMbM3AGDHCWm-HHM1xnzwyPKQfCQjgMJPxYyv0GqWoPFBK5O3r5jOe29H17cVsKf6tvsrxKwBWJe1U6YvAmmWmSicQhpPQ7DuavLsOWtjCbF-eV327UZPeAF-QydztyFzQsab_h6HT0M99NDgEE_HUI6IV1fDiExmAbfahGQ',
      },
      isAdmin: true,
    },
    info: {
      general: {
        installation_name: 'local',
        provider: 'aws',
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
};

export default initialState;
