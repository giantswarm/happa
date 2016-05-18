'use strict';

var rest = require('rest');
var mime = require('rest/interceptor/mime');
var client = rest.wrap(mime);

module.exports = function() {
  const LORRY_URL = 'http://lorry.gigantic.io/validation';

  this.validate = function(document) {
    return client({
      path: LORRY_URL,
      entity: JSON.stringify({ document: document })
    }).then(function(response) {
      if (response.status.code === 200) {
        return response.entity;
      } else {
        return {
          status: "invalid"
        };
      }
    });
  };
};