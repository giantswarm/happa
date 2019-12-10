// This is what the state looks like when someone brand new arrives at the site
// and they are not logged in at all.

export default {
  router: {
    location: {
      pathname: '/login',
      search: '',
      hash: '',
      key: '0fgz24',
    },
    action: 'POP',
  },
  app: {
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
  entities: {
    catalogs: {
      lastUpdated: 0,
      isFetching: false,
      items: [],
    },
    clusters: {
      lastUpdated: null,
      isFetching: false,
      items: {},
      nodePoolsClusters: [],
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
