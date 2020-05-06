// FlashMessage
//
// A flash message, can dismiss itself or call a function passed in through
// props on dismiss.
//

import PropTypes from 'prop-types';
import React from 'react';

class FlashMessage extends React.Component {
  static getClassName(...classNames) {
    const addedClassNames = [];
    for (const className of classNames) {
      if (!className) continue;

      addedClassNames.push(className);
    }

    return `flash-messages--flash-message flash-messages--${addedClassNames.join(
      ' '
    )}`;
  }

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
    if (!this.state.isVisible) return null;

    const {
      class: messageType,
      message,
      children,
      dismissible,
      ...rest
    } = this.props;

    return (
      <div
        {...rest}
        className={FlashMessage.getClassName(messageType, rest.className)}
      >
        {message ? message : children}

        {dismissible && (
          <i
            aria-hidden='true'
            className='fa fa-close flash-messages--dismiss'
            onClick={this.dismissFlash}
          />
        )}
      </div>
    );
  }
}

FlashMessage.propTypes = {
  dismissible: PropTypes.bool,
  onDismiss: PropTypes.func,
  class: PropTypes.string,
  message: PropTypes.any,
  children: PropTypes.node,
};

FlashMessage.defaultProps = {
  dismissible: true,
};

export default FlashMessage;
