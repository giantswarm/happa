'use strict';
import React from 'react';
import ColorHash from 'color-hash';
import PropTypes from 'prop-types';

var colorHashCache = {};

class ClusterIDLabel extends React.Component {

  constructor(props) {
    super(props);
  }

  calculateColour(str) {
    if (!colorHashCache[str]) {
      var colorHash = new ColorHash({lightness: 0.4, saturation: 0.4});
      var col = colorHash.hex(str);
      colorHashCache[str] = col;
    }

    return colorHashCache[str];
  }

  render() {
    return (
      <span style={{
        backgroundColor: this.calculateColour(this.props.clusterID),
        fontFamily: 'Inconsolata, monospace',
        padding: '0.2em 0.4em',
        borderRadius: '0.2em'
      }} title={'Unique Cluster ID: ' + this.props.clusterID}>{ this.props.clusterID }</span>
    );
  }
}

ClusterIDLabel.propTypes = {
  clusterID: PropTypes.string,
};

export default ClusterIDLabel;
