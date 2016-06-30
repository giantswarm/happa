"use strict";

var flashMessageActions     = require('../reflux_actions/flash_message_actions');
var FlashMessages           = require('../flash_messages/index.js');
var Reflux                  = require('reflux');
var React                   = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <h1>Set your new password:</h1>
      </div>
    );
  }
});