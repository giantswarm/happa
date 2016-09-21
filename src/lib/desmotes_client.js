'use strict';

var request = require('superagent-bluebird-promise');
var validate = require('validate.js');
var _ = require('underscore');

// validateOrRaise
// ----------------
// Helper method that validates an object based on constraints.
// Raises a TypeError with helpful message if the validation fails.
//
var validateOrRaise = function(validatable, constraints) {
  var validationErrors = validate(validatable, constraints, {fullMessages: false});

  if(validationErrors){
    // If there are validation errors, throw a TypeError that has readable
    // information about what went wrong.
    var messages = _.map(validationErrors, (errorMessages, field) => {
      return field + ': ' + errorMessages.join(', ');
    });
    throw(new TypeError(messages.join('\n')));
  }
};

// Desmotes
// --------
// A client for Desmotes.
// config: {endpoint: 'http://desmotes.com', timeout_ms: 10000}
//
// Example Usage:
// var desmotes = new Desmotes({endpoint: 'http://docker.dev:9001', authorizationToken: 'asdfghjk'})
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

  validateOrRaise(config, constraints);

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

      var promise = new Promise((resolve, reject) => {
        validateOrRaise(params, constraints);
        resolve(
          request
            .get(url)
            .timeout(config.timeout_ms)
            .set('Authorization', 'giantswarm ' + params.token)
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

