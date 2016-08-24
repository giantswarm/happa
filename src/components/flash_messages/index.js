// FlashMessages
//
// Shows all flash messages in the flash message store
// And provides a way to dismiss them.
//

'use strict';

import FlashMessage from './flash_message';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import _ from 'underscore';
import { connect } from 'react-redux';
import { flashRemove } from '../../actions/flashMessageActions';

var FlashMessages = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  makeFlashComponent: function(flashMessage) {
    return <FlashMessage message={flashMessage.message} key={flashMessage.key} class={flashMessage.class} onDismiss={this.dismissFlash.bind(this, flashMessage)}/>;
  },

  dismissFlash: function(flashMessage) {
    this.props.dispatch(flashRemove(flashMessage));
  },

  render: function() {
    return (
      <div className='flash-messages--container'>
        <ReactCSSTransitionGroup transitionName='flash-messages--transition' transitionEnterTimeout={200} transitionLeaveTimeout={200}>
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