import {combineReducers} from 'redux';
import organizations from './organizationReducer';
import modal from './modalReducer';
import flashMessages from './flashMessagesReducer';

const entities = combineReducers({
  organizations
});

const appState = {};

const rootReducer = combineReducers({
  entities,
  modal,
  flashMessages
});

export default rootReducer;


/*

main_store.js

{
  appState: {
    selectedOrganization: '',
    isConnected: bool, // true if the app has connectivity to the internet
    isFetching: bool, // true if the app is making an API request
    loggedInUser: "oponder", // id of the user that is currently logged in
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