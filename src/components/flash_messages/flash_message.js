// FlashMessage
//
// A flash message, can dismiss itself or call a function passed in through
// props on dismiss.
//

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

  getInitialState: function() {
    return {
      visible: true
    };
  },

  mixins: [Reflux.connect(flashStore,'flashMessages'), Reflux.listenerMixin],

  dismissFlash: function() {
    if (this.props.onDismiss) {
      this.props.onDismiss();
    } else {
      this.setState({
        visible: false
      });
    }
  },

  render: function() {
    if (this.state.visible) {
      return (
        <div className={"flash-messages--flash-message" + " flash-messages--" + this.props.class}>
          { this.props.message ? this.props.message : this.props.children }
          <i className="fa fa-times flash-messages--dismiss" aria-hidden="true" onClick={this.dismissFlash}></i>
        </div>
      );
    } else {
      return null;
    }
  }
});

