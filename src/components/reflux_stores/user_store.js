"use strict";
var Reflux = require('reflux');
var actions = require("../reflux_actions/user_actions");
var _ = require('underscore');
var validate = require('validate.js');

var user = {
  authenticated: false,
  authenticating: false,
  email: "",
  password: ""
};

module.exports = Reflux.createStore({
  listenables: actions,

  getInitialState: function() {
    user = {
      authtoken: localStorage.getItem('user.authtoken'),
      email: localStorage.getItem('user.email') || "",
      password: "",
      authenticated: localStorage.getItem('user.authtoken') ? true : false
    };

    return user;
  },

  onUpdateEmail: function(email) {
    user.email = email;
    this.trigger(user);
  },

  onUpdatePassword: function(password) {
    user.password = password;
    this.trigger(user);
  },

  onAuthenticateStarted: function() {
    user.authenticating = true;
    this.trigger(user);
  },

  onAuthenticateCompleted: function(userData) {
    localStorage.setItem('user.authtoken', userData.authtoken);
    localStorage.setItem('user.email', userData.email);

    user.authenticated = true;
    user.authenticating = false;
    user.password = "";
    this.trigger(user);
  },

  onAuthenticateFailed: function(error) {
    this.clearStoredCredentials();
  },

  onLogoutCompleted: function() {
    this.clearStoredCredentials();
  },

  clearStoredCredentials: function() {
    localStorage.removeItem('user.authtoken');
    localStorage.removeItem('user.email');

    user.authenticated = false;
    user.authenticating = false;
    this.trigger(user);
  },

  isAuthenticated: function() {
    return user.authenticated;
  }
});