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
  flashMessages
});

export default rootReducer;

/*

main_store.js

{
  app: {
    selectedOrganization: '',
    selectedCluster: '',
    isConnected: bool, // true if the app has connectivity to the internet
    firstLoadComplete: false // true after the first load is completed
    loggedInUser: {
      email: '',
      username: '',
      authToken: '',
      idToken: '',
      isAdmin: false
    }, // id of the user that is currently logged in
    info: {"general":{"installation_name":"testbot","provider":"kvm"},"workers":{"count_per_cluster":{"max":0,"default":3}}}
    }
  },

  flashMessages: {

  },

  modal: {
    visible: bool, // true if there should be a modal visible
    templateValues: {} // an object that the modal template will use
    template: '' // one of the valid modal templates
  },

  entities: { // the various entities that this app cares about
    organizations: {
      lastUpdated: 123456789,
      isFetching: bool,
      items: {
        giantswarm: {
          name: "giantswarm",
          users: ["oponder"],
          clusters: ["cluster_id"]
        }
      }
    },

    credentials: {
      items: [],
      lastUpdated: 12345679,
      isFetching: true,
    }

    clusters: {
      lastUpdated: 123456789,
      isFetching: bool,
      items: {
        cluster_id: {
          name: "Main Cluster",
          organization: ["oponder"]
        }
      }
    },

    releases: {
      activeRelease: "0.1.0",
      items: {
        "0.1.0": {"active":true,"changelog":[{"component":"vault","description":"Vault version updated."}],"components":[{"name":"vault","version":"0.7.3"}],"timestamp":"2017-10-26T16:53:00Z","version":"0.1.0"}
      }
    }
  }
}

*/
