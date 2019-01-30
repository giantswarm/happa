import { combineReducers } from 'redux';
import organizations from './organizationReducer';
import users from './userReducer';
import invitations from './invitationReducer';
import clusters from './clusterReducer';
import modal from './modalReducer';
import flashMessages from './flashMessagesReducer';
import app from './appReducer';
import releases from './releaseReducer';
import credentials from './credentialReducer';

const entities = combineReducers({
  organizations,
  clusters,
  releases,
  users,
  invitations,
  credentials,
});

const rootReducer = combineReducers({
  app,
  entities,
  modal,
  flashMessages,
});

export default rootReducer;

/*

{
  app: {
    firstLoadComplete: true,             // Becomes true after the first load is completed.
    selectedOrganization: 'giantswarm',  // The currently selected organization.
    selectedCluster: 'ib7pa'             // The currently selected cluster.

    loggedInUser: {
      email: 'oliver.ponder@gmail.com',
      auth: {
        scheme: 'Bearer',
        token: '...'
      },
      isAdmin: true
    },

    info: {
      general: {
        installation_name: 'ginger',
        provider: 'aws'
      },
      workers: {
        count_per_cluster: {
          max: 100,
          'default': 3
        },
        instance_type: {
          options: [ 'm3.large', ... ],
          'default': 'm3.large'
        }
      }
    },
  },

  entities: {
    organizations: {
      lastUpdated: 1538746613900,
      isFetching: false,
      items: {
        giantswarm: {
          id: 'giantswarm',
          members: [{email: 'developer@example.com'}]
        },
        oponder: {
          id: 'oponder',
          members: []
        }
      }
    },

    credentials: {
      items: [],
      lastUpdated: 12345679,
      isFetching: true,
    }

    clusters: {
      lastUpdated: 0,
      isFetching: false,
      items: {
        ib7pa: {
          id: 'ib7pa',
          create_date: '2018-10-05T10:54:57Z',
          name: 'pawel',
          owner: 'giantswarm',
          release_version: '5.3.0',
          metrics: {...},
          nodes: [],
          keyPairs: [],
          api_endpoint: 'https://api.ib7pa.k8s.example.gigantic.io',
          workers: [
            {
              aws: { instance_type: 'm5.large' },
              memory: { size_gb: 8 },
              storage: { size_gb: 0 },
              cpu: { cores: 2 },
              labels: {}
            },
            {
              aws: { instance_type: 'm5.large' },
              memory: { size_gb: 8 },
              storage: { size_gb: 0 },
              cpu: { cores: 2 },
              labels: {}
            },
            {
              aws: { instance_type: 'm5.large' },
              memory: { size_gb: 8 },
              storage: { size_gb: 0 },
              cpu: { cores: 2 },
              labels: {}
            }
          ]
        }
      }
    },

    releases: {
      items: {}
    },

    users: {
      lastUpdated: 1538747088527,
      isFetching: false,
      items: {
        'example@developer.com': {
          email: 'example@developer.com',
          created: '2018-09-28T14:09:28.024397212Z',
          expiry: '0001-01-01T00:00:00Z'
        }
      }
    },

    invitations: {
      lastUpdated: 0,
      isFetching: false,
      items: {}
    }
  },

  modal: {
    visible: bool,     // true if there should be a modal visible
    templateValues: {} // an object that the modal template will use
    template: ''       // one of the valid modal templates
  },

  flashMessages: [],

  router: {
    location: {
      pathname: '/',
      search: '',
      hash: ''
    },
    action: 'POP'
  }
}

*/
