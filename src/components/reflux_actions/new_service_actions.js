var Reflux = require('reflux');
var Lorry = require('../lorry');

var NewServiceActions = Reflux.createActions([
  "serviceNameEdited",
  "serviceDefinitionEdited",
  {"validateServiceDefinition": {children: ["completed", "failed"]}}
]);

NewServiceActions.validateServiceDefinition.listen(function(definition) {
  var lorry = new Lorry();
  var action = this;

  var promise = lorry.validate(definition).then(function(response) {
    action.completed(response);
  });
});

module.exports = NewServiceActions;