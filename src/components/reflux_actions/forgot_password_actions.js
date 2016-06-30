"use strict";
var Reflux = require('reflux');

var Passage = require("../../lib/passage_client");
var passage = new Passage({endpoint: window.config.passageEndpoint});

var Actions = Reflux.createActions([
  "updateEmail",
  {"requestPasswordRecoveryToken": {children: ["completed", "failed"]}},
  {"passwordEditing": {children: ["started", "completed"]}},
  {"passwordConfirmationEditing": {children: ["started", "completed"]}}
]);

Actions.requestPasswordRecoveryToken.listen(function(email) {
  var action = this;

  passage.requestPasswordRecoveryToken({email})
  .then(data => {
    action.completed(data);
  })
  .catch(x => {
    action.failed(x.message);
  });
});


module.exports = Actions;