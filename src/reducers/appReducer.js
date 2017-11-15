'use strict';

import * as types from '../actions/actionTypes';
import { browserHistory } from 'react-router';

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

export default function appReducer(state = {
    selectedOrganization: 'not-yet-loaded',
    firstLoadComplete: false,
    loggedInUser: JSON.parse(localStorage.getItem('user'))
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

    case types.LOGIN_SUCCESS:
      localStorage.setItem('user', JSON.stringify(action.userData));

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
      // // Organizations have been loaded
      // // Check if the user has an organization selected already, and if that
      // // organization still exists. If not select the first organization.
      // // And then do the same for the selected cluster.

      // var selectedOrganization = determineSelectedOrganization(action.organizations);

      // if (selectedOrganization) {
      //   selectedCluster = determineSelectedCluster(selectedOrganization, action.organizations);
      // }

      return Object.assign({}, state, {
        selectedOrganization: action.selectedOrganization,
        selectedCluster: action.selectedCluster,
        firstLoadComplete: true
      });

    default:
      return state;
  }
}
