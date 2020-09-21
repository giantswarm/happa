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
    firstLoadComplete: false,
    loggedInUser: null,
    info: {
      general: {
        availability_zones: {
          default: 0,
          max: 0,
        },
        provider: '',
      },
    },
  },
  metadata: {
    version: {
      current: 'VERSION',
      new: null,
      lastCheck: 0,
      timer: 0,
    },
  },
  entities: {
    cpAuth: {
      user: null,
      isFetching: false,
    },
    catalogs: {
      lastUpdated: 0,
      isFetching: false,
      items: {},
    },
    clusters: {
      lastUpdated: null,
      isFetching: false,
      items: {},
      v5Clusters: [],
    },
    credentials: {
      lastUpdated: 0,
      isFetching: false,
      items: [],
    },
    invitations: {
      lastUpdated: 0,
      isFetching: false,
      items: {},
    },
    organizations: {
      lastUpdated: 0,
      isFetching: false,
      items: {},
    },
    releases: {
      items: {},
    },
    users: {
      lastUpdated: 0,
      isFetching: false,
      items: {},
    },
    nodePools: {
      items: {},
    },
  },
  modal: {
    visible: false,
  },
};
