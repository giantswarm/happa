'use strict';

var rest = require('rest');
var mime = require('rest/interceptor/mime');
var client = rest.wrap(mime);

module.exports = function() {
  const IDI_URL = 'https://idi.giantswarm.io/';

  this.analyze = function(imageName) {
    return client({
      path: IDI_URL + imageName
    }).then(function(response) {
      return response.entity;
    });
  };
};