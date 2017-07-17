'use strict';

import * as types from '../actions/actionTypes';
import _ from 'underscore';

export default function organizationReducer(state = {lastUpdated: 0, isFetching: false, items: {}}, action = undefined) {
  switch(action.type) {
    case types.ORGANIZATIONS_LOAD:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: true,
        items: state.items
      };

    case types.ORGANIZATIONS_LOAD_SUCCESS:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: action.organizations
      };

    // Why is there something related to clusters in the organizationReducer?
    // Because I want my organizations to also have an array of cluster id's
    // in them. This does not come from the standard api call to get an org's
    // details. Instead, I add this info to my orgs as soon as the cluster
    // call succeeds, because then I know the owner of the cluster.
    case types.CLUSTER_LOAD_SUCCESS:
      items = Object.assign({}, state.items);

      _.each(action.clusters, (cluster) => {
        var org = items[cluster.owner] || {clusters: [], id: cluster.owner, members: []};
        var clusters = [...org.clusters, cluster.id].sort();
        clusters = _.uniq(clusters, true);

        items[cluster.owner] = Object.assign(
          {},
          org,
          {clusters: clusters}
        );
      });

      return {
        lastUpdated: Date.now(),
        isFetching: state.isFetching,
        items: items
      };

    case types.ORGANIZATIONS_LOAD_ERROR:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: state.items
      };

    case types.ORGANIZATION_DELETE_CONFIRM:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: state.isFetching,
        items: state.items
      };

    case types.ORGANIZATION_DELETE_ERROR:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: state.items
      };

    case types.ORGANIZATION_LOAD_DOMAINS:
      var items = Object.assign({}, state.items);

      items[action.organizationId] = Object.assign({}, items[action.organizationId], {domains: action.domains});

      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: items
      };

    default:
      return state;
  }
}
