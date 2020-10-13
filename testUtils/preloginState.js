import { Providers } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';

// This is what the state looks like when someone brand new arrives at the site
// and they are not logged in at all.

export default {
  router: {
    location: {
      pathname: AppRoutes.Login,
      search: '',
      hash: '',
      key: '0fgz24',
    },
    action: 'POP',
  },
  main: {
    selectedOrganization: null,
    selectedClusterID: undefined,
    firstLoadComplete: false,
    loggedInUser: null,
    info: {
      general: {
        installation_name: '',
        availability_zones: null,
        provider: Providers.AWS,
      },
      stats: {
        cluster_creation_duration: null,
      },
      workers: {
        count_per_cluster: {
          max: null,
          default: 0,
        },
      },
    },
  },
  errors: {},
  metadata: {
    version: {
      current: 'VERSION',
      new: null,
      lastCheck: 0,
      timer: 0,
    },
  },
  entities: {
    catalogs: {
      lastUpdated: 0,
      isFetching: false,
      items: {},
    },
    clusters: {
      lastUpdated: 0,
      isFetching: false,
      items: {},
      v5Clusters: [],
    },
    organizations: {
      lastUpdated: 0,
      isFetching: false,
      items: {},
      credentials: {
        lastUpdated: 0,
        isFetching: false,
        items: [],
        showForm: false,
      },
    },
    releases: {
      error: null,
      isFetching: false,
      items: {},
    },
    users: {
      lastUpdated: 0,
      isFetching: false,
      items: {},
      invitations: {
        lastUpdated: 0,
        isFetching: false,
        items: {},
      },
    },
    nodePools: {
      items: {},
      isFetching: false,
    },
    clusterLabels: {
      requestInProgress: false,
      error: null,
    },
  },
  modal: {
    visible: false,
    templateValues: {},
    template: '',
  },
};
