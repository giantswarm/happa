// FlashMessages
//
// Shows all flash messages in the flash message store
// And provides a way to dismiss them.
//

'use strict';

import FlashMessage from './flash_message';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { connect } from 'react-redux';
import { flashRemove } from '../../actions/flashMessageActions';
import PropTypes from 'prop-types';

class FlashMessages extends React.Component {
  makeFlashComponent = flashMessage => {
    return (
      <FlashMessage
        message={flashMessage.message}
        key={flashMessage.key}
        class={flashMessage.class}
        onDismiss={this.dismissFlash.bind(this, flashMessage)}
      />
    );
  };

  dismissFlash = flashMessage => {
    this.props.dispatch(flashRemove(flashMessage));
  };

  render() {
    return (
      <div className='flash-messages--container'>
        <ReactCSSTransitionGroup
          transitionName='flash-messages--transition'
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
        >
          {this.props.flashMessages.toArray().map(this.makeFlashComponent)}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

FlashMessages.contextTypes = {
  router: PropTypes.object,
};

FlashMessages.propTypes = {
  flashMessages: PropTypes.object,
  dispatch: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    flashMessages: state.flashMessages,
  };
}

module.exports = connect(mapStateToProps)(FlashMessages);
