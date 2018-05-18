'use strict';

import * as types from '../actions/actionTypes';
import { browserHistory } from 'react-router';
import GiantSwarmV4 from 'giantswarm-v4';
import _ from 'underscore';

var shutDown = function(state) {
  localStorage.removeItem('user');

  if (window.config.intercomAppId) {
    window.Intercom('shutdown');
  }

  browserHistory.push('/login');

  return Object.assign({}, state, {
    loggedInUser: {},
    firstLoadComplete: false
  });
};

function fetchUserFromStorage() {
  var user = JSON.parse(localStorage.getItem('user'));

  // User was logged in pre-jwt auth being available.
  // Migrate.
  if (user && user.authToken) {
    user.auth = {
      scheme: 'giantswarm',
      token: user.authToken
    };
  }

  return user;
}

export default function appReducer(state = {
    selectedOrganization: 'not-yet-loaded',
    firstLoadComplete: false,
    loggedInUser: fetchUserFromStorage(),
    info: {
      general: {
        provider: ''
      }
    }
  }, action = undefined) {

  switch(action.type) {
    case types.REFRESH_USER_INFO_SUCCESS:
      localStorage.setItem('user', JSON.stringify(action.userData));

      if (window.config.intercomAppId) {
        window.Intercom('boot', {
          app_id: window.config.intercomAppId,
          email: action.userData.email
        });
      }

      return Object.assign({}, state, {
        loggedInUser: action.userData
      });

    case types.INFO_LOAD_SUCCESS:
      return Object.assign({}, state, {
        info: action.info
      });

    case types.LOGIN_SUCCESS:
      localStorage.setItem('user', JSON.stringify(action.userData));
        var defaultClient = GiantSwarmV4.ApiClient.instance;
        var defaultClientAuth = defaultClient.authentications['AuthorizationHeaderToken'];
        defaultClientAuth.apiKey = action.userData.authToken;
        defaultClientAuth.apiKeyPrefix = 'giantswarm';

      return Object.assign({}, state, {
        loggedInUser: action.userData
      });

    case types.LOGIN_ERROR:
      return shutDown(state);

    case types.LOGOUT_SUCCESS:
      return shutDown(state);

    case types.LOGOUT_ERROR:
      return shutDown(state);

    case types.UNAUTHORIZED:
      return shutDown(state);

    case types.ORGANIZATION_SELECT:
      return Object.assign({}, state, {
        selectedOrganization: action.orgId,
        selectedCluster: action.selectedCluster
      });

    case types.CLUSTER_SELECT:
      localStorage.setItem('app.selectedCluster', action.clusterId);

      return Object.assign({}, state, {
        selectedCluster: action.clusterId
      });

    case types.ORGANIZATIONS_LOAD_SUCCESS:
      // Organizations have been loaded.
      // Determine if the user should be considered an admin.

      var isAdmin = false;

      var organizations = _.map(action.organizations, o => o.id);
      if (organizations.indexOf('giantswarm') != -1) {
        isAdmin = true;
      }

      var loggedInUser = Object.assign({}, state.loggedInUser, {isAdmin});

      return Object.assign({}, state, {
        selectedOrganization: action.selectedOrganization,
        selectedCluster: action.selectedCluster,
        firstLoadComplete: true,
        loggedInUser,
      });

    default:
      return state;
  }
}
