'use strict';

import * as types from '../actions/actionTypes';
import { browserHistory } from 'react-router';
import _ from 'underscore';

var firstTime = true;

var determineSelectedOrganization = function(organizations) {
  var allOrganizations = _.map(organizations, (x) => {return x.id;});
  var previouslySelectedOrganization = localStorage.getItem('app.selectedOrganization');
  var organizationStillExists = allOrganizations.indexOf(previouslySelectedOrganization) > -1;
  var selectedOrganization;

  if (previouslySelectedOrganization && organizationStillExists) {
    // The user had an organization selected, and it still exists.
    // So we stay on it.
    selectedOrganization = previouslySelectedOrganization;

  } else {
    // The user didn't have an organization selected yet, or the one
    // they selected is gone. Switch to the first organization in the list.
    var firstOrganization = _.map(organizations, (x) => {return x.id;})[0];
    localStorage.setItem('app.selectedOrganization', firstOrganization);

    selectedOrganization = firstOrganization;
  }

  return selectedOrganization;
};

var determineSelectedCluster = function(selectedOrganization, organizations) {
  var previouslySelectedCluster = localStorage.getItem('app.selectedCluster');
  var clusterStillExists = organizations[selectedOrganization].clusters.indexOf(previouslySelectedCluster) > -1;
  var selectedCluster;

  if (previouslySelectedCluster && clusterStillExists) {
    selectedCluster = previouslySelectedCluster;
  } else {
    var firstCluster = organizations[selectedOrganization].clusters[0];
    localStorage.setItem('app.selectedCluster', firstCluster);
    selectedCluster =  firstCluster;
  }

  return selectedCluster;
};

var shutDown = function(state) {
  localStorage.removeItem('user');
  firstTime = true;

  window.Intercom('shutdown');
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

      window.Intercom('boot', {
        app_id: window.config.intercomAppId,
        email: action.userData.email
      });

      return Object.assign({}, state, {
        loggedInUser: action.userData
      });

    case types.LOGIN_SUCCESS:
      localStorage.setItem('user', JSON.stringify(action.userData));

      return Object.assign({}, state, {
        loggedInUser: action.userData
      });

    case types.LOGOUT_SUCCESS:
      return shutDown(state);

    case types.LOGOUT_ERROR:
      return shutDown(state);

    case types.UNAUTHORIZED:
      return shutDown(state);

    case types.ORGANIZATION_SELECT:
      localStorage.setItem('app.selectedOrganization', action.orgId);

      // We're changing to a different organization
      // Make sure we have a reasonable value for selectedCluster.
      var selectedCluster = determineSelectedCluster(action.orgId, action.organizations);

      return Object.assign({}, state, {
        selectedOrganization: action.orgId,
        selectedCluster: selectedCluster
      });

    case types.CLUSTER_SELECT:
      localStorage.setItem('app.selectedCluster', action.clusterId);

      return Object.assign({}, state, {
        selectedCluster: action.clusterId
      });

    case types.ORGANIZATIONS_LOAD_SUCCESS:
      // Organizations have been loaded
      // If its first time loading, lets check if the user has an organization
      // selected already, and if that organization still exists. and if not select the first organization.
      // And then do the same for the selected cluster.

      if (firstTime) {
        firstTime = false;

        var selectedOrganization = determineSelectedOrganization(action.organizations);
        var selectedCluster = determineSelectedCluster(selectedOrganization, action.organizations);

        return Object.assign({}, state, {
          selectedOrganization: selectedOrganization,
          selectedCluster: selectedCluster,
          firstLoadComplete: true
        });
      } else {
        return state;
      }

      break;

    default:
      return state;
  }
}