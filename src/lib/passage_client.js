'use strict';

var request = require('superagent-bluebird-promise');
var helpers = require('./helpers');

//
// Passage
// -------
// A client for Passage.
// config: {
//  endpoint: 'http://passage.com',
//  timeout_ms: 10000 # When a request should time out
// }
//
// Example Usage:
// var passage = new Passage({endpoint: 'http://docker.dev:5000'})
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

  helpers.validateOrRaise(config, constraints);

  if (config.timeout_ms === undefined) {
    config.timeout_ms = 10000;
  }

  return {
    //
    // checkInvite
    // -----------
    // Check if a invitation token is valid for a certain contactId
    // params: {contactId: '12345', token: 'abcdef'}
    //
    checkInvite: function(params) {
      var constraints = {
        contactId: { presence: true },
        token: { presence: true }
      };

      var url = `${config.endpoint}/invite/${params.contactId}/${params.token}`;

      var promise = new Promise((resolve) => {
        helpers.validateOrRaise(params, constraints);
        resolve(request.get(url)
        .timeout(config.timeout_ms));
      })
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
    // params: {contactId: '12345', inviteToken: 'abcdef', password: 'uvwxyz'}
    //
    createAccount: function(params) {
      var constraints = {
        contactId: { presence: true },
        inviteToken: { presence: true },
        password: { presence: true }
      };

      var url = `${config.endpoint}/accounts/`;

      // Passage is not expecting camelcase in its json body
      // Converting it here.
      var payload = {
        'contact_id': params.contactId,
        'invite_token': params.inviteToken,
        'password': params.password
      };

      var promise = new Promise((resolve) => {
        helpers.validateOrRaise(params, constraints);
        resolve(request.post(url)
          .timeout(config.timeout_ms)
          .send(payload)
          .set('ContentType', 'application/json'));
      })
      .then(x => {
        return(x.body);
      });

      return promise;
    },

    //
    // requestPasswordRecoveryToken
    // -----------
    // Request a password recovery token, which passage will send to the user's email.
    // params: {email: 'some_valid_email@example.com'}
    //
    requestPasswordRecoveryToken: function(params) {
      var constraints = {
        email: { presence: true, email: true }
      };

      var url = `${config.endpoint}/recovery/`;

      var payload = {
        email: params.email
      };

      var promise = new Promise((resolve) => {
        helpers.validateOrRaise(params, constraints);
        resolve(request.post(url)
          .timeout(config.timeout_ms)
          .send(payload)
          .set('ContentType', 'application/json'));
      })
      .then(x => {
        return(x.body);
      });

      return promise;
    },

    //
    // verifyPasswordRecoveryToken
    // -----------
    // Verify a password recovery token. Promise only resolves if the token is valid.
    // If the token is invalid, or the request fails for some reason the promise is
    // rejected.
    //
    // params: {email: 'some_valid_email@example.com', token: '123456abcdefg'}
    //
    verifyPasswordRecoveryToken: function(params) {
      var constraints = {
        email: { presence: true, email: true },
        token: { presence: true }
      };

      var url = `${config.endpoint}/recovery/${params.token}/`;

      var payload = {
        email: params.email
      };

      var promise = new Promise((resolve) => {
        helpers.validateOrRaise(params, constraints);
        resolve(request.post(url)
          .timeout(config.timeout_ms)
          .send(payload)
          .set('ContentType', 'application/json'));
      })
      .then(x => {
        if (x.body.is_valid) {
          return(x.body);
        } else {
          throw(new Error('Invalid Token'));
        }
      });

      return promise;
    },

    //
    // setNewPassword
    // -----------
    // Set a new password. Requires a valid recovery token.
    // If the token is invalid, or the request fails for some reason the promise is
    // rejected.
    //
    // params: {email: 'some_valid_email@example.com', token: '123456abcdefg', password: 'users_new_password'}
    //
    setNewPassword: function(params) {
      var constraints = {
        email: { presence: true, email: true },
        token: { presence: true },
        password: { presence: true }
      };

      var url = `${config.endpoint}/recovery/${params.token}/password/`;

      var payload = {
        email: params.email,
        password: params.password
      };

      var promise = new Promise((resolve) => {
        helpers.validateOrRaise(params, constraints);
        resolve(request.post(url)
          .timeout(config.timeout_ms)
          .send(payload)
          .set('ContentType', 'application/json'));
      })
      .then(x => {
        return(x.body);
      });

      return promise;
    }
  };
};

export default Passage;

