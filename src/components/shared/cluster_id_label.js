'use strict';
import React from 'react';
import ColorHash from 'color-hash';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap/lib';
import copy from 'copy-to-clipboard';

var colorHashCache = {};

class ClusterIDLabel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      copied: false,
    };
  }

  calculateColour(str) {
    if (!colorHashCache[str]) {
      var colorHash = new ColorHash({ lightness: 0.4, saturation: 0.4 });
      var col = colorHash.hex(str);
      colorHashCache[str] = col;
    }

    return colorHashCache[str];
  }

  copyToClipboard(e) {
    e.preventDefault();
    e.stopPropagation();
    copy(this.props.clusterID);

    this.setState({
      copied: true,
    });
  }

  mouseLeave() {
    this.setState({
      copied: false,
    });
  }

  render() {
    return (
      <div
        className='cluster-id-label'
        onMouseLeave={this.mouseLeave.bind(this)}
      >
        <span
          style={{
            backgroundColor: this.calculateColour(this.props.clusterID),
            fontFamily: 'Inconsolata, monospace',
            padding: '0.2em 0.4em',
            borderRadius: '0.2em',
          }}
          title={'Unique Cluster ID: ' + this.props.clusterID}
        >
          {this.props.clusterID}
        </span>

        {this.props.copyEnabled ? (
          this.state.copied ? (
            <i className='fa fa-check' aria-hidden='true' />
          ) : (
            <OverlayTrigger
              placement='top'
              overlay={
                <Tooltip id='tooltip'>
                  Copy {this.props.clusterID} to clipboard.
                </Tooltip>
              }
            >
              <i
                onClick={this.copyToClipboard.bind(this)}
                className='fa fa-clipboard'
                aria-hidden='true'
              />
            </OverlayTrigger>
          )
        ) : (
          undefined
        )}
      </div>
    );
  }
}

ClusterIDLabel.propTypes = {
  clusterID: PropTypes.string,
  copyEnabled: PropTypes.bool,
};

export default ClusterIDLabel;
