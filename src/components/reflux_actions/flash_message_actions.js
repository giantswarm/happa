"use strict";
var Reflux = require('reflux');

var flashMessageActions = Reflux.createActions([
  "add",
  "remove",
  "clearAll"
]);

module.exports = flashMessageActions;