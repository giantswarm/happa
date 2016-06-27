"use strict";

var request = require('superagent-bluebird-promise');
var validate = require("validate.js");
var _ = require("underscore");

//
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
      return field + ": " + errorMessages.join(", ");
    });
    throw(new TypeError(messages.join("\n")));
  }
};

//
// Passage
// -------
// A client for Passage.
// config: {endpoint: "http://passage.com", timeout_ms: 10000}
//
// Example Usage:
// var passage = new Passage({endpoint: "http://docker.dev:5000"})
//
var Passage = function(config) {
  var constraints = {
    endpoint: {
      presence: true,
      url: {
        allowLocal: true
      }
    }
  };

  validateOrRaise(config, constraints);

  if (config.timeout_ms === undefined) {
    config.timeout_ms = 10000;
  }

  return {
    //
    // checkInvite
    // -----------
    // Check if a invitation token is valid for a certain contactId
    // params: {contactId: "12345", token: "abcdef"}
    //
    checkInvite: function(params) {
      var constraints = {
        contactId: { presence: true },
        token: { presence: true }
      };

      validateOrRaise(params, constraints);
      var url = `${config.endpoint}/invite/${params.contactId}/${params.token}`;

      var promise = request.get(url)
      .timeout(config.timeout_ms)
      .then(x => {
        if (x.body.is_valid) {
          return(x.body);
        } else {
          throw(Error('InvalidTokenOrContactID'));
        }
      });

      return promise;
    },

    //
    // createAccount
    // -----------
    // Create an account
    // params: {contactId: "12345", inviteToken: "abcdef", password: "uvwxyz"}
    //
    createAccount: function(params) {
      var constraints = {
        contactId: { presence: true },
        inviteToken: { presence: true },
        password: { presence: true }
      };

      validateOrRaise(params, constraints);
      var url = `${config.endpoint}/accounts/`;

      // Passage is not expecting camelcase in its json body
      // Converting it here.
      var payload = {
        "contact_id": params.contactId,
        "invite_token": params.inviteToken,
        "password": params.password
      };

      var promise = request.post(url)
      .timeout(config.timeout_ms)
      .send(payload)
      .set("ContentType", "application/json")
      .then(x => {
        return(x.body);
      });

      return promise;
    }
  };
};

module.exports = Passage;

