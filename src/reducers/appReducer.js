'use strict';

import * as types from '../actions/actionTypes';
import GiantSwarmV4 from 'giantswarm-v4';

var shutDown = function(state) {
  localStorage.removeItem('user');

  return Object.assign({}, state, {
    loggedInUser: {},
    firstLoadComplete: false,
  });
};

function fetchUserFromStorage() {
  var user;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    user = {
      auth: {},
    };
  }

  // User was logged in pre-jwt auth being available.
  // Migrate.
  if (user && user.authToken) {
    user.auth = {
      scheme: 'giantswarm',
      token: user.authToken,
    };
  }

  return user;
}

function fetchSelectedOrganizationFromStorage() {
  return localStorage.getItem('app.selectedOrganization');
}

// determineSelectedOrganization takes a current list of organizations and the
// users selectedOrganization (which could be stale, i.e. deleted by someone
// else)
//
// Using this information, it ensures we always have a valid organization selected.
var determineSelectedOrganization = function(
  organizations,
  selectedOrganization
) {
  var organizationStillExists =
    organizations.indexOf(selectedOrganization) > -1;

  if (selectedOrganization && organizationStillExists) {
    // The user had an organization selected, and it still exists.
    // So we stay on it.
  } else {
    // The user didn't have an organization selected yet, or the one
    // they selected is gone. Switch to the first organization in the list.
    var firstOrganization = organizations[0];
    selectedOrganization = firstOrganization;
  }

  return selectedOrganization;
};

export default function appReducer(
  state = {
    selectedOrganization: fetchSelectedOrganizationFromStorage(),
    firstLoadComplete: false,
    loggedInUser: fetchUserFromStorage(),
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
  action = undefined
) {
  switch (action.type) {
    case types.REFRESH_USER_INFO_SUCCESS:
      localStorage.setItem('user', JSON.stringify(action.userData));

      return Object.assign({}, state, {
        loggedInUser: action.userData,
      });

    case types.INFO_LOAD_SUCCESS:
      return Object.assign({}, state, {
        info: action.info,
      });

    case types.LOGIN_SUCCESS:
      localStorage.setItem('user', JSON.stringify(action.userData));
      var defaultClient = GiantSwarmV4.ApiClient.instance;
      var defaultClientAuth =
        defaultClient.authentications['AuthorizationHeaderToken'];
      defaultClientAuth.apiKey = action.userData.auth.token;
      defaultClientAuth.apiKeyPrefix = action.userData.auth.scheme;

      return Object.assign({}, state, {
        loggedInUser: action.userData,
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
      localStorage.setItem('app.selectedOrganization', action.orgId);

      return Object.assign({}, state, {
        selectedOrganization: action.orgId,
      });

    case types.ORGANIZATIONS_LOAD_SUCCESS:
      // Organizations have been loaded.

      // Determine if the user should be considered an admin.
      var isAdmin = false;

      var organizations = Object.entries(action.organizations).map(
        ([, o]) => o.id
      );
      if (organizations.indexOf('giantswarm') != -1) {
        isAdmin = true;
      }

      var loggedInUser = Object.assign({}, state.loggedInUser, { isAdmin });

      // Deterimine what organization should be selected.
      var selectedOrganization = determineSelectedOrganization(
        organizations,
        state.selectedOrganization
      );
      localStorage.setItem('app.selectedOrganization', selectedOrganization);

      return Object.assign({}, state, {
        selectedOrganization: selectedOrganization,
        loggedInUser,
      });

    case types.CLUSTERS_LOAD_SUCCESS:
      return Object.assign({}, state, {
        firstLoadComplete: true,
      });

    default:
      return state;
  }
}
