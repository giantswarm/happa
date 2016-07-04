"use strict";
var Reflux = require('reflux');
var userActions = require("../reflux_actions/user_actions");
var clusterActions = require("../reflux_actions/cluster_actions");
var clusterStore = require("../reflux_stores/cluster_store");
var _ = require('underscore');
var validate = require('validate.js');

var user = {
  authenticated: false,
  authenticating: false,
  email: "",
  password: ""
};

module.exports = Reflux.createStore({
  listenables: userActions,

  getInitialState: function() {
    user = {
      authtoken: localStorage.getItem('user.authtoken'),
      email: localStorage.getItem('user.email') || "",
      password: "",
      authenticated: localStorage.getItem('user.authtoken') ? true : false
    };

    return user;
  },

  currentUser: function() {
    return user;
  },

  onUpdateEmail: function(email) {
    user.email = email;
    localStorage.setItem('user.email', email);
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

    clusterActions.fetchAll();
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