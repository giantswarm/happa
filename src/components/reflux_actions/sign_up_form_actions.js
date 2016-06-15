"use strict";
var Reflux = require('reflux');

var Passage = require("../../lib/passage_client");
var passage = new Passage({endpoint: window.config.passageEndpoint});

var Actions = Reflux.createActions([
  {"checkInvite": {children: ["completed", "failed"]}},
  {"createAccount": {children: ["completed", "failed"]}},
  {"passwordEditing": {children: ["started", "completed"]}},
  {"passwordConfirmationEditing": {children: ["started", "completed"]}},
  "tosChanged"
]);

Actions.checkInvite.listen(function(contactId, token) {
  var action = this;

  passage.checkInvite({contactId, token})
  .then(data => {
    console.log("Invite is valid!");
    action.completed(data);
  })
  .catch(x => {
    action.failed(x.message);
  });
});


Actions.createAccount.listen(function(account) {
  var action = this;

  passage.createAccount(account)
  .then(data => {
    console.log("Account created");
    action.completed(data);
  })
  .catch(x => {
    action.failed(x.message);
  });
});

module.exports = Actions;