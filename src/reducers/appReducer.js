"use strict";

import * as types from '../actions/actionTypes';
import _ from 'underscore';
import { browserHistory } from 'react-router';

var firstTime = true;

export default function appReducer(state = {selectedOrganization: 'not-yet-loaded'}, action = undefined) {
  switch(action.type) {
    case types.ORGANIZATION_SELECT:
      localStorage.setItem('app.selectedOrganization', action.orgId);
      browserHistory.push('/');
      return {selectedOrganization: action.orgId};

    case types.ORGANIZATIONS_LOAD_SUCCESS:
      // Organizations have been loaded
      // If its first time loading, lets check if the user has an organization
      // selected already, and if that organization stille exists. and if not select the first organization.

      if (firstTime) {
        firstTime = false;
        var allOrganizations = _.map(action.organizations, (x) => {return x.id;});
        var previouslySelectedOrganization = localStorage.getItem('app.selectedOrganization');
        var organizationStillExists = allOrganizations.indexOf(previouslySelectedOrganization) > -1;

        if (previouslySelectedOrganization && organizationStillExists) {
          // The user had an organization selected, and it still exists.
          // So we stay on it.
          return {selectedOrganization: previouslySelectedOrganization};
        } else {
          // The user didn't have an organization selected yet, or the one
          // they selected is gone. Switch to the first organization in the list.
          var firstOrganization = _.map(action.organizations, (x) => {return x.id;})[0];
          localStorage.setItem('app.selectedOrganization', firstOrganization);
          return {selectedOrganization: firstOrganization};
        }
      } else {
        return state;
      }

      break;

    default:
      return state;
  }
}