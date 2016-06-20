"use strict";

var flashActions            = require('../reflux_actions/flash_message_actions');
var flashStore              = require('../reflux_stores/flash_message_store');
var Reflux                  = require('reflux');
var React                   = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var _                       = require('underscore');

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  mixins: [Reflux.connect(flashStore,'flashMessages'), Reflux.listenerMixin],

  makeFlashComponent: function(flashMessage) {
    return(
      <div className={"flash-messages--flash-message" + " flash-messages--" + flashMessage.class} key={flashMessage.key}>
        {flashMessage.message}
        <div className="flash-messages--dismiss" onClick={this.dismissFlash.bind(this, flashMessage)}>x</div>
      </div>
    );
  },

  dismissFlash: function(flashMessage) {
    flashActions.remove(flashMessage);
  },

  render: function() {
    console.log(_.map(Array.from(this.state.flashMessages), this.makeFlashComponent));
    return (
      <div className="flash-messages--container">
        { _.map(flashStore.getAll(), this.makeFlashComponent) }
      </div>
    );
  }
});