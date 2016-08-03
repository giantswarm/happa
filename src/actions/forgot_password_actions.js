"use strict";
var Reflux = require('reflux');

var Passage = require("../lib/passage_client");
var passage = new Passage({endpoint: window.config.passageEndpoint});

var Actions = Reflux.createActions([
  // Request recovery form
  "updateEmail",
  {"requestPasswordRecoveryToken": {children: ["completed", "failed"]}},

  // Update password form
  {"verifyPasswordRecoveryToken": {children: ["completed", "failed"]}},
  {"passwordEditing": {children: ["started", "completed"]}},
  {"passwordConfirmationEditing": {children: ["started", "completed"]}},
  {"setNewPassword": {children: ["completed", "failed"]}}
]);

Actions.requestPasswordRecoveryToken.listen(function(email) {
  var action = this;

  try {
    passage.requestPasswordRecoveryToken({email})
    .then(data => {
      action.completed(data);
    })
    .catch(error => {
      action.failed(error);
    });
  } catch(error) {
    action.failed(error);
  }
});

Actions.verifyPasswordRecoveryToken.listen(function(email, token) {
  var action = this;

  try {
    passage.verifyPasswordRecoveryToken({email, token})
    .then(data => {
      action.completed(data);
    })
    .catch(error => {
      action.failed(error);
    });
  } catch(error) {
    action.failed(error);
  }
});

Actions.setNewPassword.listen(function(email, token, password) {
  var action = this;

  try {
    passage.setNewPassword({email, token, password})
    .then(data => {
      action.completed(data);
    })
    .catch(error => {
      action.failed(error);
    });
  } catch(error) {
    console.log(error);
    action.failed(error);
  }
});


module.exports = Actions;