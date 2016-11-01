import { combineReducers } from 'redux';
import organizations from './organizationReducer';
import clusters from './clusterReducer';
import modal from './modalReducer';
import flashMessages from './flashMessagesReducer';
import app from './appReducer';
import { routerReducer } from 'react-router-redux';


const entities = combineReducers({
  organizations,
  clusters,
});

const rootReducer = combineReducers({
  app,
  entities,
  modal,
  flashMessages,
  routing: routerReducer
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
      authToken: ''
    }, // id of the user that is currently logged in
  },

  flashMessages: {

  },

  modal: {
    visible: bool, // true if there should be a modal visible
    templateValues: {} // an object that the modal template will use
    template: '' // one of the valid modal templates
  },

  entities: { // the various entities that this app cares about
    users: {
      lastUpdated: 123456789 // timestamp of when the entities were last updated
      isFetching: bool,
      items: {
        oponder: {
          name: "oponder",
          organizations: ["giantswarm"]
        }
      }
    },

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

    invoices: {
      lastUpdated: 123456789,
      isFetching: bool,
      items: {
        invoice_id: {
          ... invoice properties
          organization: ["oponder"]
        }
      }
    }
  }
}

*/