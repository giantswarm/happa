"use strict";
// A wrapper for the GiantSwarm JS Client
// It initializes the client with the right end point
// if the user happens to have one set in localstorage

var GiantSwarm = require('giantswarm');

var unauthorizedCallback = null;

var GiantSwarmClient = {
  // Constructor that initializes a GiantSwarm JS Client
  // with the proper endpoint, and unauthorized callback
  // if one is set.
  Client: function() {
    var apiEndpoint = window.config.apiEndpoint;
    var cluster = localStorage.getItem('user.clusterid');
    var authToken = localStorage.getItem('user.authtoken');

    var giantSwarm = new GiantSwarm();

    if (cluster) {
      giantSwarm.clusterId = cluster;
    }

    giantSwarm.authToken = authToken;

    if(localStorage.getItem('user.endpoint')) {
      giantSwarm.apiEndpoint = localStorage.getItem('user.endpoint');
    } else {
      giantSwarm.apiEndpoint = apiEndpoint;
    }

    return giantSwarm;
  }
};

module.exports = GiantSwarmClient;
