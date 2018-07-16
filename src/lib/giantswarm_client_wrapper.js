'use strict';

// A wrapper for the GiantSwarm JS Client
// It initializes the client with the right end point
// if the user happens to have one set in localstorage
import GiantSwarm from 'giantswarm';

var GiantSwarmClient = {
  // Constructor that initializes a GiantSwarm JS Client
  // with the proper endpoint, and unauthorized callback
  // if one is set.
  Client: function(authToken) {
    var apiEndpoint = window.config.apiEndpoint;

    var giantSwarm = new GiantSwarm({
      authToken: authToken,
      onUnauthorized: function() {
        throw('unauthorized!');
      }
    });

    if(localStorage.getItem('user.endpoint')) {
      giantSwarm.apiEndpoint = localStorage.getItem('user.endpoint');
    } else {
      giantSwarm.apiEndpoint = apiEndpoint;
    }

    return giantSwarm;
  }
};

export default GiantSwarmClient;
