"use strict";
var Reflux = require('reflux');
var actions = require("../reflux_actions/user_actions");
var _ = require('underscore');
var validate = require('validate.js');

var user = {
  authenticated: false,
  authenticating: false,
  username: "",
  password: ""
};

module.exports = Reflux.createStore({
  listenables: actions,

  getInitialState: function() {
    user = {
      authtoken: localStorage.getItem('user.authtoken'),
      username: localStorage.getItem('user.username'),
      email: localStorage.getItem('user.email'),
      password: "",
      authenticated: localStorage.getItem('user.authtoken') ? true : false
    };

    return user;
  },

  onUpdateUsername: function(username) {
    user.username = username;
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
    localStorage.setItem('user.username', userData.username);
    localStorage.setItem('user.email', userData.email);

    user.authenticated = true;
    user.authenticating = false;
    user.password = "";
    this.trigger(user);
  },

  onAuthenticateFailed: function(userData) {
    localStorage.removeItem('user.authtoken');
    localStorage.removeItem('user.username');
    localStorage.removeItem('user.email');

    user.authenticated = false;
    user.authenticating = false;
    this.trigger(user);
  },

  onLogoutCompleted: function() {
    localStorage.removeItem('user.authtoken');
    localStorage.removeItem('user.username');
    localStorage.removeItem('user.email');

    user.authenticated = false;
    user.authenticating = false;
    this.trigger(user);
  },

  isAuthenticated: function() {
    return user.authenticated;
  }
});