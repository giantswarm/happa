"use strict";
var Reflux = require('reflux');
var actions = require("../reflux_actions/new_service_actions");
var Lorry = require('../lorry');
var _ = require('underscore');

var newService = {
  serviceName: 'my-first-service',
  rawComposeYaml: 'helloworld:\n  image: index.docker.io/giantswarm/helloworld\n  ports:\n    - "8080:8080"',
  parsedCompose: "NOTPARSEDYET",
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
    newService.rawComposeYaml = definition;
    this.trigger(newService);
  },

  onValidateServiceDefinition: function() {
  },

  onValidateServiceDefinitionCompleted: function(validationResult) {
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

    console.log(newService.images);
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
    console.log(error);
    image.analyzeError = error;
    this.trigger(newService);
  }
});