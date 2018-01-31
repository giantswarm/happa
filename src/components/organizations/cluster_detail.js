'use strict';

import _ from 'underscore';
import ReleaseDetailsModal from '../modal/release_details_modal';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as clusterActions from '../../actions/clusterActions';
import * as releaseActions from '../../actions/releaseActions';
import ClusterKeyPairs from './cluster_key_pairs';
import DocumentTitle from 'react-document-title';
import { flashAdd } from '../../actions/flashMessageActions';
import ClusterIDLabel from '../shared/cluster_id_label';
import { relativeDate } from '../../lib/helpers.js';
import Button from '../button/index';
import ScaleClusterModal from './scale_cluster_modal';
import { browserHistory } from 'react-router';

class ClusterDetail extends React.Component {
  constructor (props){
    super(props);

    this.state = {
      loading: true,
      releaseDetailsModalVisible: false,
    };
  }

  componentWillMount() {
    this.setState({
      loading: true
    });

    if (this.props.cluster === undefined) {
      browserHistory.push('/organizations/'+this.props.organizationId);
      this.setState({
        notfound: true
      });

      this.props.dispatch(flashAdd({
        message: <div><b>Cluster &quot;{this.props.clusterId}&quot; not found.</b><br/>Please make sure the Cluster ID is correct and that you have access to the organization that it belongs to.</div>,
        class: 'info',
        ttl: 6000
      }));

    } else {
      this.props.releaseActions.loadReleases()
      .then(() => {
        return this.props.clusterActions.clusterLoadDetails(this.props.cluster.id);
      })
      .then(() => {
        this.setState({
          loading: false
        });
      })
      .catch((error) => {
        console.error(error);

        this.props.dispatch(flashAdd({
          message: 'Something went wrong while trying to load cluster details. Please try again later or contact support: support@giantswarm.io',
          class: 'danger'
        }));

        this.setState({
          loading: 'failed'
        });
      });
    }
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

  showDeleteClusterModal(cluster) {
    this.props.clusterActions.clusterDelete(cluster);
  }

  showReleaseDetails = () => {
    this.releaseDetailsModal.show();
  }

  showScalingModal = () => {
    this.scaleClusterModal.getWrappedInstance().reset();
    this.scaleClusterModal.getWrappedInstance().show();
  }

  clusterName() {
    if (this.props.cluster) {
      return this.props.cluster.name;
    } else {
      return 'Not found';
    }
  }

  render() {
    var awsInstanceType = <tr/>;
    if (this.props.provider === 'aws' && this.state.loading === false) {
      awsInstanceType = (
        <tr>
          <td>AWS instance type</td>
          <td className='value code'>{this.props.cluster.workers[0].aws.instance_type}</td>
        </tr>
      );
    }

    return (
      <DocumentTitle title={'Cluster Details | ' + this.clusterName() +  ' | Giant Swarm'}>
        { this.state.loading === false ?
          <div>
            <div className="cluster-details">
              <div className='row'>
                <div className='col-12'>
                  <h1>
                    <ClusterIDLabel clusterID={this.props.cluster.id} />
                    {' '}
                    {this.props.cluster.name} {this.state.loading ? <img className='loader' width="25px" height="25px" src='/images/loader_oval_light.svg'/> : ''}
                  </h1>
                </div>
              </div>
            </div>
            <div>
              <div className="cluster-details">
                <div className='row'>
                  <div className='col-12'>
                    <table className='table resource-details'>
                      <tbody>
                        <tr>
                          <td>Created</td>
                          <td className='value'>{this.props.cluster.create_date ? relativeDate(this.props.cluster.create_date) : 'n/a'}</td>
                        </tr>
                        {
                          this.props.release ?
                          <tr>
                            <td>Release version</td>
                            <td className='value code'>
                              <a onClick={this.showReleaseDetails}>
                                {this.props.cluster.release_version}
                                {
                                  (() => {
                                    var kubernetes = _.find(this.props.release.components, component => component.name === 'kubernetes');
                                    if (kubernetes) {
                                      return ' \u2014 includes Kubernetes ' + kubernetes.version;
                                    }
                                  })()
                                }
                              </a>
                            </td>
                          </tr>
                          :
                          <tr>
                            <td>Kubernetes version</td>
                            <td className='value code'>
                              {
                                this.props.cluster.kubernetes_version !== '' && this.props.cluster.kubernetes_version !== undefined ?
                                this.props.cluster.kubernetes_version
                                :
                                'n/a'
                              }
                            </td>
                          </tr>
                        }
                        <tr>
                          <td>Kubernetes API endpoint</td>
                          <td className='value code'>{this.props.cluster.api_endpoint ? this.props.cluster.api_endpoint : 'n/a'}</td>
                        </tr>
                        <tr>
                          <td>Number of worker nodes</td>
                          <td className='value'>
                            {this.props.cluster.workers ? this.props.cluster.workers.length : 'n/a'}
                            &nbsp;
                            {
                              this.props.provider === 'aws' ?
                              <Button onClick={this.showScalingModal}>Scale</Button>
                              : undefined
                            }
                          </td>
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
                          <td>Total storage in worker nodes</td>
                          <td className='value'>{this.getStorageTotal() === null ? 'n/a' : this.getStorageTotal()} GB</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <ClusterKeyPairs cluster={this.props.cluster} />

              <div className='row section cluster_delete'>
                <div className='row'>
                  <div className='col-12'>
                    <h3 className='table-label'>Delete This Cluster</h3>
                  </div>
                </div>
                <div className='row'>
                  <div className='col-9'>
                    <p>All workloads on this cluster will be terminated. Data stored on the worker nodes will be lost. There is no way to undo this action.</p>
                    <Button bsStyle='danger' onClick={this.showDeleteClusterModal.bind(this, this.props.cluster)}>Delete Cluster</Button>
                  </div>
                </div>
              </div>
              <ScaleClusterModal ref={(s) => {this.scaleClusterModal = s;}} cluster={this.props.cluster} user={this.props.user}/>
            </div>
            <ReleaseDetailsModal ref={(r) => {this.releaseDetailsModal = r;}} releases={[this.props.release]} />
          </div>
        :
          undefined
        }
      </DocumentTitle>
    );
  }
}

ClusterDetail.propTypes = {
  clusterActions: React.PropTypes.object,
  cluster: React.PropTypes.object,
  clusterId: React.PropTypes.string,
  dispatch: React.PropTypes.func,
  organizationId: React.PropTypes.string,
  releaseActions: React.PropTypes.object,
  release: React.PropTypes.object,
  provider: React.PropTypes.string,
  user: React.PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  var cluster = state.entities.clusters.items[ownProps.params.clusterId];
  let release;

  if (cluster.release_version && cluster.release_version !== '') {
    release = state.entities.releases.items[cluster.release_version];
  }

  return {
    organizationId: ownProps.params.orgId,
    cluster: cluster,
    clusterId: ownProps.params.clusterId,
    provider: state.app.info.general.provider,
    release: release,
    user: state.app.loggedInUser
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
    releaseActions: bindActionCreators(releaseActions, dispatch),
    dispatch: dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ClusterDetail);
