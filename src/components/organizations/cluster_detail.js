'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from '../../actions/clusterActions';
import ClusterKeyPairs from './cluster_key_pairs';
import DocumentTitle from 'react-document-title';
import { flashAdd } from '../../actions/flashMessageActions';

class ClusterDetail extends React.Component {
  constructor (props){
    super(props);

    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    this.setState({
      loading: true
    });

    this.props.actions.clusterLoadDetails(this.props.cluster.id)
    .then(() => {
      this.setState({
        loading: false
      });
    })
    .catch(() => {
      this.props.dispatch(flashAdd({
        message: 'Something went wrong while trying to load cluster details. Please try again later or contact support: support@giantswarm.io',
        class: 'danger',
        ttl: 3000
      }));

      this.setState({
        loading: 'failed'
      });
    });
  }

  render() {
    return (
      <DocumentTitle title={'Cluster Details | ' + this.props.cluster.name +  ' | Giant Swarm'}>
        <div className="cluster-details">
          <div className='row'>
            <div className='col-12'>
              <h1>Details for cluster: {this.props.cluster.name} {this.state.loading ? <img className='loader' width="25px" height="25px" src='/images/loader_oval_light.svg'/> : ''} </h1>
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

          {this.state.loading ? '' : <ClusterKeyPairs cluster={this.props.cluster} />}
        </div>
      </DocumentTitle>
    );
  }
}

ClusterDetail.propTypes = {
  cluster: React.PropTypes.object,
  clusters: React.PropTypes.object,
  dispatch: React.PropTypes.func,
  actions: React.PropTypes.object
};

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

