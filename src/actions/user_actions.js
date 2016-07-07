"use strict";
var Reflux = require('reflux');
var GiantSwarm = require('../lib/giantswarm_client_wrapper');

var UserActions = Reflux.createActions([
  "updateEmail",
  "updatePassword",
  {"authenticate": {children: ["started", "completed", "failed"]}},
  {"logout": {children: ["started", "completed", "failed"]}}
]);

// pass in username and password? or all of state?
UserActions.authenticate.listen(function(email, password) {
  var action = this;
  action.started();

  var giantSwarm = new GiantSwarm.Client();

  // Todo don't throw errors from JS client. It should return a rejected promise.
  // try {
    giantSwarm.authenticate({
      usernameOrEmail: email,
      password: password
    })
    .then(function(response) {
      if (response.result === true) {
        return giantSwarm.user()
        .then((data) => {
          var userData = {
            email: data.result.email,
            authtoken: giantSwarm.authToken
          };
          action.completed(userData);
        }, (error) => {
          action.failed("Error while fetching user details: Please try again later or contact support.");
        });
      } else {
        action.failed("Invalid email and/or password.");
      }
    })
    .catch(error => {
      if (error.status === 400) {
        if (error.res && error.res.body && error.res.body.status_code === 10008) {
          action.failed("Invalid email and/or password.");
        } else if (error.res && error.res.body && error.res.body.status_code === 10010) {
          action.failed("Invalid email and/or password.");
        } else {
          action.failed("Something went wrong while trying to log in. Perhaps our server is down. Error message: " + error.message);
        }
      } else {
        action.failed("Something went wrong while trying to log in. Perhaps our server is down. Error message: " + error.message);
      }

    });
  // } catch(error) {
  //   action.failed(error.message.split(",").join(", "));
  // }
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