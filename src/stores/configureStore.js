"use strict";
/*

main_store.js

{
  selectedOrganization: '',
  isConnected: bool, // true if the app has connectivity to the internet
  isFetching: bool, // true if the app is making an API request
  loggedInUser: "oponder", // id of the user that is currently logged in

  flashMessages: {

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

import {createStore, applyMiddleware, compose} from 'redux';
import rootReducer from '../reducers';
import thunk from 'redux-thunk';
import reduxImmutableStateInvariant from 'redux-immutable-state-invariant';

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(thunk, reduxImmutableStateInvariant())
  );
}