'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from '../../actions/clusterActions';
import ClusterKeyPairs from './cluster_key_pairs';

class ClusterDetail extends React.Component {
  render() {
    return (
      <div>
        <div className='row'>
          <div className='col-12'>
            <h1>Details for cluster: {this.props.cluster.name}</h1>
          </div>
        </div>

        {
          // <div className='row section'>
          //   <div className='col-3'>
          //     <h3 className='table-label'>Cluster Name</h3>
          //   </div>
          //   <div className='col-9'>
          //     <p>A meaningful cluster name will make your life easier once you work with multiple clusters.</p>
          //   </div>
          // </div>
        }

        <ClusterKeyPairs cluster={this.props.cluster} />
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  var cluster = state.entities.clusters.items[ownProps.params.clusterId];

  return {
    clusters: state.entities.clusters,
    cluster: cluster
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClusterDetail);

