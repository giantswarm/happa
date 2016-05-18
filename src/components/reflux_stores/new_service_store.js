"use strict";
var Reflux = require('reflux');
var actions = require("../reflux_actions/new_service_actions");

var newService = {
  serviceName: 'my-first-service',
  composeYaml: 'helloworld:\n  image: giantswarm/helloworld\n  ports:\n    - "8080:8080"'
};

module.exports = Reflux.createStore({
  listenables: actions,

  getInitialState: function() {
    return newService;
  },

  onServiceNameEdited: function(name) {
    newService.serviceName = name;
    this.trigger(newService);
  },

  onServiceDefinitionEdited: function(definition) {
    newService.composeYaml = definition;
    this.trigger(newService);
  }
});