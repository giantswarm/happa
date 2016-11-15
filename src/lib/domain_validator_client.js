'use strict';

var request = require('superagent-bluebird-promise');
var _ = require('underscore');
var helpers = require('./helpers');

// DomainValidator
// --------
// A client for the Domain Validator microservice.
// config: {
//  endpoint: 'https://domain-validator.giantswarm.io',
//  authorizationToken: 'asdfghjkl'  # A Giant Swarm user's authentication token,
//  timeout_ms: 10000                # When a request should time out
// }
//
// Example Usage:
// var domainValidator = new DomainValidator({
//  endpoint: 'http://docker.dev:9001',
//  authorizationToken: 'asdfghjk',
// });
//
export default function DomainValidator(config) {
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

    //
    // domains
    // -----------
    // List all domains an organization has.
    //
    domains: function(params) {
      var constraints = {
        organizationId: { presence: true }
      };

      var promise = new Promise((resolve, reject) => {
        helpers.validateOrRaise(params, constraints);

        var url = `${config.endpoint}/organizations/${params.organizationId}/domains/`;

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
          throw(new Error('Could not fetch domains. Not authorized or no such organization.'));
        } else {
          throw(error);
        }
      });

      return promise;
    },

    //
    // addDomain
    // -----------
    // Add a domain for validation to be used by an organization.
    //
    addDomain: function(params) {
      var constraints = {
        organizationId: { presence: true },
        domain: { presence: true }
      };

      var promise = new Promise((resolve, reject) => {
        helpers.validateOrRaise(params, constraints);

        var url = `${config.endpoint}/organizations/${params.organizationId}/domains/${params.domain}`;

        resolve(
          request
            .put(url)
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
          throw(new Error('Could not add domain. Not authorized or no such organization.'));
        } else {
          throw(error);
        }
      });

      return promise;
    },

    //
    // deleteDomain
    // -----------
    // Delete a domain belonging to an organization.
    //
    deleteDomain: function(params) {
      var constraints = {
        organizationId: { presence: true },
        domain: { presence: true }
      };

      var promise = new Promise((resolve, reject) => {
        helpers.validateOrRaise(params, constraints);

        var url = `${config.endpoint}/organizations/${params.organizationId}/domains/${params.domain}`;

        resolve(
          request
            .delete(url)
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
          throw(new Error('Could not delete domain. Not authorized or no such organization.'));
        } else {
          throw(error);
        }
      });

      return promise;
    }
  };
};

