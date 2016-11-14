'use strict';

import React from 'react';

class ClusterDetail extends React.Component {
  render() {
    return (
      <h1>Details for cluster: {this.props.params.clusterId}</h1>
    );
  }
}

export default ClusterDetail;