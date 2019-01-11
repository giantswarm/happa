'use strict';

var request = require('superagent-bluebird-promise');
var helpers = require('./helpers');

//
// APIClusterStatusClient
// -------
// A client for API cluster status endpoint.
// config: {
//  endpoint: 'http://api.g8s...com',
//  timeout_ms: 10000 # When a request should time out
// }
//
// Example Usage:
// var apiClusterStatus = new APIClusterStatusClient({endpoint: 'http://localhost:5000'})
//
var APIClusterStatusClient = function(config) {
  var constraints = {
    endpoint: {
      presence: true,
      url: {
        allowLocal: true,
      },
    },
  };

  helpers.validateOrRaise(config, constraints);

  if (config.timeout_ms === undefined) {
    config.timeout_ms = 10000;
  }

  return {
    //
    // getStatus
    // -----------
    // Get status for a cluster.
    //
    getClusterStatus: function(authHeaderVal, clusterId) {
      var url = `${config.endpoint}/v4/clusters/${clusterId}/status/`;

      var promise = new Promise(resolve => {
        resolve(
          request
            .get(url)
            .timeout(config.timeout_ms)
            .set('Accept', 'application/json')
            .set('Authorization', authHeaderVal));
      }).then(x => {
        return x.body;
      });

      return promise;
    },
  };
};

export default APIClusterStatusClient;
