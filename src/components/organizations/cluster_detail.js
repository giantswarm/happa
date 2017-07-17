'use strict';

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from '../../actions/clusterActions';
import ClusterKeyPairs from './cluster_key_pairs';
import DocumentTitle from 'react-document-title';
import { flashAdd } from '../../actions/flashMessageActions';
import ClusterIDLabel from '../shared/cluster_id_label';
import { relativeDate } from '../../lib/helpers.js';

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
      console.log(this.props.cluster);
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

  getMemoryTotal() {
    if (!this.props.cluster.workers) {
      return null;
    }
    var m = 0.0;
    for (var i=0; i<this.props.cluster.workers.length; i++) {
      m += this.props.cluster.workers[i].memory.size_gb;
    }
    return m;
  }

  getStorageTotal() {
    if (!this.props.cluster.workers) {
      return null;
    }
    var s = 0.0;
    for (var i=0; i<this.props.cluster.workers.length; i++) {
      s += this.props.cluster.workers[i].storage.size_gb;
    }
    return s;
  }

  getCpusTotal() {
    if (!this.props.cluster.workers) {
      return null;
    }
    var c = 0;
    for (var i=0; i<this.props.cluster.workers.length; i++) {
      c += this.props.cluster.workers[i].cpu.cores;
    }
    return c;
  }

  render() {
    var awsInstanceType = <tr/>;
    if (this.props.cluster.workers && this.props.cluster.workers[0].aws.instance_type) {
      awsInstanceType = (
        <tr>
          <td>AWS instance type</td>
          <td className='value code'>{this.props.cluster.workers[0].aws.instance_type}</td>
        </tr>
      );
    }

    return (
      <DocumentTitle title={'Cluster Details | ' + this.props.cluster.name +  ' | Giant Swarm'}>
        <div className="cluster-details">
          <div className='row'>
            <div className='col-12'>
              <h1>
                <ClusterIDLabel clusterID={this.props.cluster.id} />
                {this.props.cluster.name} {this.state.loading ? <img className='loader' width="25px" height="25px" src='/images/loader_oval_light.svg'/> : ''}
              </h1>
            </div>
            <div className='row'>
              <div className='col-12'>
                <table className='table resource-details'>
                  <tbody>
                    <tr>
                      <td>Created</td>
                      <td className='value'>{this.props.cluster.create_date ? relativeDate(this.props.cluster.create_date) : 'n/a'}</td>
                    </tr>
                    <tr>
                      <td>Kubernetes version</td>
                      <td className='value code'>{this.props.cluster.kubernetes_version ? this.props.cluster.kubernetes_version : 'n/a'}</td>
                    </tr>
                    <tr>
                      <td>Kubernetes API endpoint</td>
                      <td className='value code'>{this.props.cluster.api_endpoint ? this.props.cluster.api_endpoint : 'n/a'}</td>
                    </tr>
                    <tr>
                      <td>Number of worker nodes</td>
                      <td className='value'>{this.props.cluster.workers ? this.props.cluster.workers.length : 'n/a'}</td>
                    </tr>
                    {awsInstanceType}
                    <tr>
                      <td>Total CPU cores in worker nodes</td>
                      <td className='value'>{this.getCpusTotal() === null ? 'n/a' : this.getCpusTotal()}</td>
                    </tr>
                    <tr>
                      <td>Total RAM in worker nodes</td>
                      <td className='value'>{this.getMemoryTotal() === null ? 'n/a' : this.getMemoryTotal()} GB</td>
                    </tr>
                    <tr>
                      <td>Total Storage in worker nodes</td>
                      <td className='value'>{this.getStorageTotal() === null ? 'n/a' : this.getStorageTotal()} GB</td>
                    </tr>
                  </tbody>
                </table>

              </div>
            </div>
          </div>

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
