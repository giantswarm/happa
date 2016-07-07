"use strict";

var flashActions            = require('../../actions/flash_message_actions');
var flashStore              = require('../../stores/flash_message_store');
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
        <i className="fa fa-times flash-messages--dismiss" aria-hidden="true" onClick={this.dismissFlash.bind(this, flashMessage)}></i>
      </div>
    );
  },

  dismissFlash: function(flashMessage) {
    flashActions.remove(flashMessage);
  },

  render: function() {
    return (
      <div className="flash-messages--container">
        <ReactCSSTransitionGroup transitionName='flash-messages--transition' transitionEnterTimeout={200} transitionLeaveTimeout={1}>
          { _.map(flashStore.getAll(), this.makeFlashComponent) }
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});