"use strict";
var Reflux = require('reflux');
var Lorry = require('../lib/lorry');
var IDI = require('../lib/idi');

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
  var completed = false;

  action.started(imageName);

  var fakeProgressInterval = setInterval(function() {
    if (!completed) {
      n += 1;
      action.progress(imageName, 75 - (75/n));
    }
  }, 400 + (Math.random() * 400));

  idi.analyze(imageName).then(function(response) {
    completed = true;
    clearInterval(fakeProgressInterval);
    action.completed(imageName, response);
  }, function(error) {
    completed = true;
    clearInterval(fakeProgressInterval);
    action.failed(imageName, error);
  });
});


module.exports = NewServiceActions;