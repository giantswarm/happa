// FlashMessage
//
// A flash message, can dismiss itself or call a function passed in through
// props on dismiss.
//

'use strict';

import React from 'react';

class FlashMessage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      visible: true
    };
  }

  dismissFlash = () => {
    if (this.props.onDismiss) {
      this.props.onDismiss();
    } else {
      this.setState({
        visible: false
      });
    }
  }

  render() {
    if (this.state.visible) {
      return (
        <div className={'flash-messages--flash-message' + ' flash-messages--' + this.props.class}>
          { this.props.message ? this.props.message : this.props.children }
          <i className='fa fa-times flash-messages--dismiss' aria-hidden='true' onClick={this.dismissFlash}></i>
        </div>
      );
    } else {
      return null;
    }
  }
}

FlashMessage.contextTypes = {
  router: React.PropTypes.object
};

FlashMessage.propTypes = {
  onDismiss: React.PropTypes.func,
  class: React.PropTypes.string,
  message: React.PropTypes.any,
  children: React.PropTypes.node
};

export default FlashMessage;