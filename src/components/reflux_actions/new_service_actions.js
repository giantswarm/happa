"use strict";
var Reflux = require('reflux');
var Lorry = require('../lorry');
var IDI = require('../idi');

var NewServiceActions = Reflux.createActions([
  "serviceNameEdited",
  "serviceDefinitionEdited",
  {"validateServiceDefinition": {children: ["completed", "failed"]}},
  {"analyzeImage": {children: ["started", "completed", "failed", "progress"]}},
  "componentRamLimitEdited"
]);

NewServiceActions.validateServiceDefinition.listen(function(definition) {
  var lorry = new Lorry();
  var action = this;

  lorry.validate(definition).then(function(response) {
    action.completed(response);
  });
});

NewServiceActions.analyzeImage.listen(function(imageName) {
  var idi = new IDI();
  var action = this;
  var progress = 0;
  var n = 0;

  action.started(imageName);

  var fakeProgressInterval = setInterval(function() {
    n += 1;
    action.progress(imageName, 75 - (75/n));
  }, 400 + (Math.random() * 400));

  idi.analyze(imageName).then(function(response) {
    clearInterval(fakeProgressInterval);
    action.completed(imageName, response);
  }, function(error) {
    clearInterval(fakeProgressInterval);
    action.failed(imageName, error);
  });
});


module.exports = NewServiceActions;