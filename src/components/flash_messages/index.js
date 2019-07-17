// FlashMessages
//
// Shows all flash messages in the flash message store
// And provides a way to dismiss them.
//

import { connect } from 'react-redux';
import { flashRemove } from 'actions/flashMessageActions';
import FlashMessage from './flash_message';
import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

class FlashMessages extends React.Component {
  makeFlashComponent = flashMessage => {
    return (
      <FlashMessage
        class={flashMessage.class}
        key={flashMessage.key}
        message={flashMessage.message}
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
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
          transitionName='flash-messages--transition'
        >
          {this.props.flashMessages.toArray().map(this.makeFlashComponent)}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

FlashMessages.propTypes = {
  flashMessages: PropTypes.object,
  dispatch: PropTypes.func,
};

function mapStateToProps(state) {
  return {
    flashMessages: state.flashMessages,
  };
}

export default connect(mapStateToProps)(FlashMessages);
