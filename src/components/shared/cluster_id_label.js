'use strict';
import React from 'react';
import ColorHash from 'color-hash';


class ClusterIDLabel extends React.Component {

  constructor(props) {
    super(props);
    var col = this.calculateColour(props.clusterID);
    this.state = {
      backgroundColor: col
    };
  }

  calculateColour(str) {
    var colorHash = new ColorHash({lightness: 0.4, saturation: 0.4});
    var col = colorHash.hex(str);
    return col;
  }

  render() {
    return (
      <span style={{
        backgroundColor: this.state.backgroundColor,
        fontFamily: 'Inconsolata, monospace',
        padding: '0.2em 0.5em',
        borderRadius: '2px',
        marginRight: '0.5em',
      }} title={'Unique Cluster ID: ' + this.props.clusterID}>{ this.props.clusterID }</span>
    );
  }
}

ClusterIDLabel.propTypes = {
  clusterID: React.PropTypes.string,
};

export default ClusterIDLabel;
