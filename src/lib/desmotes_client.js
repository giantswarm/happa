'use strict';

var request = require('superagent-bluebird-promise');
var helpers = require('./helpers');

// Desmotes
// --------
// A client for Desmotes.
// config: {
//  endpoint: 'http://desmotes.com',
//  authorizationToken: 'asdfghjkl'  # A Giant Swarm user's authentication token,
//  timeout_ms: 10000                # When a request should time out
// }
//
// Example Usage:
// var desmotes = new Desmotes({endpoint: 'http://localhost:9001', authorizationToken: 'asdfghjk'})
//
var Desmotes = function(config) {
  var constraints = {
    endpoint: {
      presence: true,
      url: {
        allowLocal: true
      }
    },
    authorizationToken: {
      presence: true
    }
  };

  helpers.validateOrRaise(config, constraints);

  if (config.timeout_ms === undefined) {
    config.timeout_ms = 10000;
  }

  return {

    // clusterMetrics
    // -----------
    // Fetch metrics for a given clusterId.
    //
    clusterMetrics: function(params) {
      var constraints = {
        clusterId: { presence: true }
      };

      var url = `${config.endpoint}/cluster/${params.clusterId}/`;

      var promise = new Promise((resolve) => {
        helpers.validateOrRaise(params, constraints);
        resolve(
          request
            .get(url)
            .timeout(config.timeout_ms)
            .set('Authorization', 'giantswarm ' + config.authorizationToken)
            .set('ContentType', 'application/json')
        );
      })
      .then(response => {
        return response.body;
      })
      .catch(error => {
        if (error.status && error.status === 401) {
          throw(new Error('Could not fetch cluster details. Not authorized or no such cluster.'));
        } else {
          throw(error);
        }
      });

      return promise;
    },
  };
};

module.exports = Desmotes;
