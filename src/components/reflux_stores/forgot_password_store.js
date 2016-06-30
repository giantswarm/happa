"use strict";
var Reflux = require('reflux');
var forgotPasswordActions = require("../reflux_actions/forgot_password_actions");

module.exports = Reflux.createStore({
  listenables: forgotPasswordActions,

  getInitialState: function() {
    var form = {
      submitting: false,
      email: ""
    };

    return form;
  }
});