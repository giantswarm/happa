// FlashMessage
//
// A flash message, can dismiss itself or call a function passed in through
// props on dismiss.
//

import PropTypes from 'prop-types';
import React from 'react';

class FlashMessage extends React.Component {
  state = {
    isVisible: true,
  };

  dismissFlash = () => {
    if (this.props.onDismiss) {
      this.props.onDismiss();
    } else {
      this.setState({
        isVisible: false,
      });
    }
  };

  render() {
    if (this.state.isVisible) {
      return (
        <div
          className={`${'flash-messages--flash-message' + ' flash-messages--'}${
            this.props.class
          }`}
        >
          {this.props.message ? this.props.message : this.props.children}
          <i
            aria-hidden='true'
            className='fa fa-close flash-messages--dismiss'
            onClick={this.dismissFlash}
          />
        </div>
      );
    }

    return null;
  }
}

FlashMessage.propTypes = {
  onDismiss: PropTypes.func,
  class: PropTypes.string,
  message: PropTypes.any,
  children: PropTypes.node,
};

export default FlashMessage;
