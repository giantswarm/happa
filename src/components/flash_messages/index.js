// FlashMessages
//
// Shows all flash messages in the flash message store
// And provides a way to dismiss them.
//

"use strict";

var flashActions            = require('../../actions/flash_message_actions');
var flashStore              = require('../../stores/flash_message_store');
var FlashMessage            = require('./flash_message');
var Reflux                  = require('reflux');
var React                   = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var _                       = require('underscore');
import {connect} from 'react-redux';
import {flashRemove} from '../../actions/flashMessageActions';

var FlashMessages = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  mixins: [Reflux.connect(flashStore,'flashMessages'), Reflux.listenerMixin],

  makeFlashComponent: function(flashMessage) {
    return <FlashMessage message={flashMessage.message} key={flashMessage.key} class={flashMessage.class} onDismiss={this.dismissFlash.bind(this, flashMessage)}/>;
  },

  dismissFlash: function(flashMessage) {
    flashActions.remove(flashMessage);
    this.props.dispatch(flashRemove(flashMessage));
  },

  render: function() {
    return (
      <div className="flash-messages--container">
        <ReactCSSTransitionGroup transitionName='flash-messages--transition' transitionEnterTimeout={200} transitionLeaveTimeout={1}>
          { _.map(flashStore.getAll(), this.makeFlashComponent) }
          { _.map(this.props.flashMessages.toArray(), this.makeFlashComponent) }
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});

function mapStateToProps(state, ownProps) {
  return {
    flashMessages: state.flashMessages
  };
}

module.exports = connect(mapStateToProps)(FlashMessages);