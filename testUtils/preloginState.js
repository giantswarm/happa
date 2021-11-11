import { MainRoutes } from 'shared/constants/routes';

// This is what the state looks like when someone brand new arrives at the site
// and they are not logged in at all.

export default {
  router: {
    location: {
      pathname: MainRoutes.Login,
      search: '',
      hash: '',
      key: '0fgz24',
    },
    action: 'POP',
  },
  main: {
    selectedOrganization: null,
    selectedClusterID: null,
    firstLoadComplete: false,
    loggedInUser: null,
  },
  errors: {},
  metadata: {
    version: {
      current: '',
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
      idsAwaitingUpgrade: {},
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
