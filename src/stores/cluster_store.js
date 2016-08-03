"use strict";
var Reflux = require('reflux');
var clusterActions = require("../actions/cluster_actions");
var _ = require('underscore');

var clusterStore = "NOTLOADED";

module.exports = Reflux.createStore({
  listenables: clusterActions,

  getInitialState: function() {
    return clusterStore;
  },

  latestCluster: function() {
    return clusterStore[0];
  },

  onFetchAllCompleted: function(clusters) {
    clusterStore = clusters;
    this.trigger(clusterStore);
  },

  onFetchAllFailed: function(error) {
    clusterStore = "LOADINGFAILED";
    this.trigger(clusterStore);
    window.alert(error);
  }

});