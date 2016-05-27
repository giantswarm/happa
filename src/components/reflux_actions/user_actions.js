"use strict";
var Reflux = require('reflux');
var GiantSwarm = require('../utils/giantswarm_client_wrapper');

var UserActions = Reflux.createActions([
  "updateUsername",
  "updatePassword",
  {"authenticate": {children: ["started", "completed", "failed"]}},
  {"logout": {children: ["started", "completed", "failed"]}}
]);

// pass in username and password? or all of state?
UserActions.authenticate.listen(function(username, password) {
  var action = this;
  action.started();

  var giantSwarm = new GiantSwarm.Client();

  // Todo don't throw errors from JS client. It should return a rejected promise.
  try {
    giantSwarm.authenticate({
      username: username,
      password: password
    }).then(function(response) {
      if (response.result === true) {

        giantSwarm.user().then((data) => {
          var userData = {
            username: data.result.username,
            email: data.result.email,
            authtoken: giantSwarm.authToken
          };
          action.completed(userData);
        }, (error) => {
          action.failed();
        });

      } else {
        action.failed();
      }
    });
  } catch(error) {
    action.failed(error);
  }
});

UserActions.logout.listen(function() {
  var action = this;
  action.started();

  var giantSwarm = new GiantSwarm.Client();

  giantSwarm.logout().then(() => {
    action.completed();
  }, function() {
    action.completed();
  });
});

module.exports = UserActions;