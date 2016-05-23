"use strict";
var Reflux = require('reflux');
var actions = require("../reflux_actions/new_service_actions");
var Lorry = require('../lorry');
var _ = require('underscore');
var validate = require('validate.js');

var newService = {
  fields: {
    serviceName: {value: 'my-first-service', validationErrors: []},
    rawComposeYaml: {
      value: 'helloworld:\n  image: index.docker.io/giantswarm/helloworld\n  ports:\n    - "8080:8080"',
      validationErrors: []
    }
  },
  parsedCompose: "NOTPARSEDYET",
};

var serviceNameConstraint = {
  presence: true,
  format: {
    pattern: /^[a-zA-Z0-9_\-]*$/,
    message: "must only contain letters, numbers, underscores, and hyphens"
  }
};

module.exports = Reflux.createStore({
  listenables: actions,

  getInitialState: function() {
    return newService;
  },

  onServiceNameEdited: function(name) {
    var validationErrors = validate.single(name, serviceNameConstraint);
    newService.fields.serviceName = {value: name, validationErrors: validationErrors};
    this.trigger(newService);
  },

  onServiceDefinitionEdited: function(definition) {
    newService.fields.rawComposeYaml.value = definition;
    this.trigger(newService);
  },

  onComponentRamLimitEdited: function(componentName, limit) {
    newService.parsedCompose[componentName].ramLimit = limit;
    this.trigger(newService);
  },


  onValidateServiceDefinition: function() {
  },

  onValidateServiceDefinitionCompleted: function(validationResult) {
    if (validationResult.errors) {
      newService.fields.rawComposeYaml.validationErrors = validationResult.errors.map(
        function(errorObject) {return errorObject.error.message;}
      );
    }

    newService.parsedCompose = validationResult.document;

    newService.images = _.map(newService.parsedCompose, function(val, key) {
      var image = _.findWhere(newService.images, {name: val.image});
      var status = "NOTSTARTED";
      var progress = 0;

      if (image && image.analyzeStatus) {
        status = image.analyzeStatus;
      }

      if (image && image.analyzeStatus) {
        progress = image.analyzeProgress;
      }

      if (status === "NOTSTARTED") {
        actions.analyzeImage(val.image);
      }

      return {
        name: val.image,
        analyzeProgress: progress,
        analyzeStatus: status
      };
    });

    newService.images = _.uniq(newService.images, function isUniq(item) {
      return String(item.name);
    });

    newService.parsedCompose = _.mapObject(newService.parsedCompose, function(componentData, componentName) {
      componentData.ramLimit = 128;
      return componentData;
    });

    this.trigger(newService);
  },

  onAnalyzeImage: function(imageName) {
    var image = _.findWhere(newService.images, {name: imageName});
    image.analyzeProgress = 0;
    image.analyzeStatus = "STARTING";
    this.trigger(newService);
  },

  onAnalyzeImageStarted: function(imageName) {
    var image = _.findWhere(newService.images, {name: imageName});
    image.analyzeStatus = "STARTED";
    this.trigger(newService);
  },

  onAnalyzeImageProgress: function(imageName, progress) {
    var image = _.findWhere(newService.images, {name: imageName});
    image.analyzeProgress = progress;
    this.trigger(newService);
  },

  onAnalyzeImageCompleted: function(imageName, analyzeResult) {
    var image = _.findWhere(newService.images, {name: imageName});
    // Check if there was an unauthorized, set analyzeStatus to UNAUTHORIZED
    image.analyzeProgress = 100;
    image.analyzeStatus = "DONE";
    this.trigger(newService);
  },

  onAnalyzeImageFailed: function(imageName, error) {
    var image = _.findWhere(newService.images, {name: imageName});
    image.analyzeProgress = 0;
    image.analyzeStatus = "FAILED";
    image.analyzeError = error;
    this.trigger(newService);
  }
});