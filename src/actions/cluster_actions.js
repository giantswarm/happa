"use strict";
var Reflux = require('reflux');
var GiantSwarm = require('../lib/giantswarm_client_wrapper');
var _ = require('underscore');

var ClusterActions = Reflux.createActions([
  {"fetchAll": {children: ["started", "completed", "failed"]}},
]);

ClusterActions.fetchAll.listen(function() {
  var action = this;
  action.started();

  var giantSwarm = new GiantSwarm.Client();

  // Fetch all organizations
  giantSwarm.memberships()
  .then(response => {
    return response.result; // Return just the array of organizations
  })
  .then(organizations => {
    // For each organization, fetch the clusters it has
    return Promise.all(_.map(organizations, organizationName => {
      return giantSwarm.clusters({ organizationName })
             .then(response => {
               return response.result.clusters || [];
             });
    }));
  })
  .then(clustersPerOrganization => {
    // Flatten the array of arrays of clusters
    var clusters = _.flatten(clustersPerOrganization);

    // Sort descending by date
    var clustersSortedByDate = _.sortBy(clusters, cluster => {
      return Date.parse(cluster.create_date);
    }).reverse();

    // Return just the IDs
    var justClusterIDs = _.map(clustersSortedByDate, cluster => {
      return cluster.id;
    });

    return justClusterIDs;
  })
  .then(clusterIDs => {
    // For each ID fetch cluster details
    // Return null if fetching of details fails for any reason.
    // TODO: Reconsider if returning null on failure here is wise.
    return Promise.all(_.map(clusterIDs, clusterId => {
      return giantSwarm.clusterDetails({ clusterId })
             .then(response => {
                return response.result;
             })
             .catch(error => {
                return null;
             });
    }));
  })
  // Resolve the promise wtih an array of all cluster details.
  .then(orderedClusterDetails => {
    action.completed(_.compact(orderedClusterDetails));
  })
  // If something went wrong, fail the action
  .catch(error => {
    action.failed(error);
  });
});

module.exports = ClusterActions;