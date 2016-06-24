"use strict";
var Reflux = require('reflux');
var GiantSwarm = require('../utils/giantswarm_client_wrapper');
var _ = require('underscore');

var ClusterActions = Reflux.createActions([
  {"fetchAll": {children: ["started", "completed", "failed"]}},
]);

ClusterActions.fetchAll.listen(function() {
  var action = this;
  action.started();

  var giantSwarm = new GiantSwarm.Client();

  giantSwarm.memberships()
  .then(response => {
    return response.result; // Array of organizations
  })
  .then(organizations => {
    return Promise.all(_.map(organizations, organizationName => {
      return giantSwarm.clusters({ organizationName })
             .then(response => {
               return response.result.clusters;
             });
    }));
  })
  .then(clustersPerOrganization => {
    var clusters = _.flatten(clustersPerOrganization);

    var clustersSortedByDate = _.sortBy(clusters, cluster => {
      return Date.parse(cluster.create_date);
    }).reverse();

    var justClusterIDs = _.map(clustersSortedByDate, cluster => {
      return cluster.id;
    });

    return justClusterIDs;
  })
  .then(clusterIDs => {
    return Promise.all(_.map(clusterIDs, clusterId => {
      return giantSwarm.clusterDetails({ clusterId })
             .then(response => {
                return response.result;
             })
             // Deal graciously with clusters for which there are no details.
             .catch(error => {
                return null;
             });
    }));
  })
  .then(orderedClusterDetails => {
    action.completed(_.compact(orderedClusterDetails));
  })
  .catch(error => {
    action.failed(error);
  });
});

module.exports = ClusterActions;