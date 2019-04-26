import copy from 'copy-to-clipboard';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import PropTypes from 'prop-types';
import React from 'react';
import Tooltip from 'react-bootstrap/lib/Tooltip';

class Copyable extends React.Component {
  state = {
    copied: false,
  };

  copyToClipboard = e => {
    e.preventDefault();
    e.stopPropagation();
    copy(this.props.copyText);

    this.setState({
      copied: true,
    });
  };

  mouseLeave = () => {
    this.setState({
      copied: false,
    });
  };

  render() {
    return (
      <div
        className='copyable'
        onClick={this.copyToClipboard}
        onMouseLeave={this.mouseLeave}
        style={{ cursor: 'pointer' }}
      >
        <div className='copyable-content'>{this.props.children}</div>

        <div className='copyable-tooltip'>
          {this.state.copied ? (
            <i className='fa fa-done' aria-hidden='true' />
          ) : (
            <OverlayTrigger
              placement='top'
              overlay={<Tooltip id='tooltip'>Copy to clipboard.</Tooltip>}
            >
              <i className='fa fa-content-copy' aria-hidden='true' />
            </OverlayTrigger>
          )}
        </div>
      </div>
    );
  }
}

Copyable.propTypes = {
  children: PropTypes.object,
  copyText: PropTypes.string,
};

export default Copyable;
