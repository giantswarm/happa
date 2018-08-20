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
import UpgradeClusterModal from './upgrade_cluster_modal';
import { push } from 'connected-react-router';
import cmp from 'semver-compare';
import PropTypes from 'prop-types';
import { Breadcrumb } from 'react-breadcrumbs';

class ClusterDetail extends React.Component {
  constructor (props){
    super(props);

    this.state = {
      loading: true
    };
  }

  componentWillMount() {
    this.setState({
      loading: true
    });

    if (this.props.cluster === undefined) {
      this.props.dispatch(push('/organizations/'+this.props.organizationId));
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
    return m.toFixed(2);
  }

  getStorageTotal() {
    if (!this.props.cluster.workers) {
      return null;
    }
    var s = 0.0;
    for (var i=0; i<this.props.cluster.workers.length; i++) {
      s += this.props.cluster.workers[i].storage.size_gb;
    }
    return s.toFixed(2);
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

  showUpgradeModal = () => {
    this.upgradeClusterModal.getWrappedInstance().show();
  }

  clusterName() {
    if (this.props.cluster) {
      return this.props.cluster.name;
    } else {
      return 'Not found';
    }
  }

  // Determine whether the current cluster can be upgraded
  canClusterUpgrade() {
    // the user must be an admin
    if (this.props.user.isAdmin !== true) {
      return false;
    }

    // provider must be AWS or Azure
    if (this.props.provider !== 'aws' && this.props.provider !== 'azure') {
      return false;
    }

    // cluster must have a release_version
    if (this.props.cluster.release_version === '') return false;

    // a target release to upgrade to must be defined
    if (!!this.props.targetRelease !== true) {
      return false;
    }

    // cluster release_version must be > 3 on AWS and > 1 on Azure
    if (this.props.provider === 'aws') {
      if (cmp(this.props.cluster.release_version, '3.0.0') === -1) {
        return false;
      }
    } else if (this.props.provider === 'azure') {
      if (cmp(this.props.cluster.release_version, '1.0.0') === -1) {
        return false;
      }
    }

    return true;
  }

  // Determine whether the cluster can be scaled
  canClusterScale() {
    if (this.props.provider === 'aws') {
      return true;
    }

    if (this.props.provider === 'kvm') {
      return true;
    }

    // on Azure, release version must be >= 1.0.0
    if (this.props.provider === 'azure' && cmp(this.props.cluster.release_version, '1.0.0') !== -1) {
      return true;
    }
  }

  accessCluster = () => {
    this.props.clusterActions.clusterSelect(this.props.cluster.id);
    this.props.dispatch(push('/getting-started/'));
  }

  render() {
    var instanceTypeOrVMSize = <tr/>;
    if (this.state.loading === false) {
      if (this.props.provider === 'aws') {
        instanceTypeOrVMSize = (
          <tr>
            <td>EC2 instance type</td>
            <td className='value code'>{this.props.cluster.workers[0].aws.instance_type}</td>
          </tr>
        );
      } else if (this.props.provider === 'azure') {
        instanceTypeOrVMSize = (
          <tr>
            <td>VM size</td>
            <td className='value code'>{this.props.cluster.workers[0].azure.vm_size}</td>
          </tr>
        );
      }
    }

    return (
      <Breadcrumb data={{title: this.props.cluster.id, pathname: '/organizations/' + this.props.cluster.owner + '/clusters/' + this.props.cluster.id}}>
        <Breadcrumb data={{title: this.props.cluster.owner.toUpperCase(), pathname: '/organizations/' + this.props.cluster.owner}}>
          <Breadcrumb data={{title: 'ORGANIZATIONS', pathname: '/organizations/'}}>
            <DocumentTitle title={'Cluster Details | ' + this.clusterName() +  ' | Giant Swarm'}>
              { this.state.loading === false ?
                <div>
                  <div className="cluster-details">
                    <div className='row'>
                      <div className='col-7'>
                        <h1>
                          <ClusterIDLabel clusterID={this.props.cluster.id} copyEnabled />
                          {' '}
                          {this.props.cluster.name} {this.state.loading ? <img className='loader' width="25px" height="25px" src='/images/loader_oval_light.svg'/> : ''}
                        </h1>
                      </div>
                      <div className='col-5'>
                        <div className='pull-right btn-group'>
                          <Button onClick={this.accessCluster}>GET STARTED</Button>
                          {
                            this.canClusterScale() ?
                            <Button onClick={this.showScalingModal}>SCALE</Button>
                            : undefined
                          }

                          {
                            this.canClusterUpgrade() ?
                            <Button onClick={this.showUpgradeModal}>UPGRADE</Button>
                            : undefined
                          }

                        </div>
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
                                      {' '}
                                      {
                                        (() => {
                                          var kubernetes = _.find(this.props.release.components, component => component.name === 'kubernetes');
                                          if (kubernetes) {
                                            return <span>
                                            &mdash; includes Kubernetes {kubernetes.version}
                                            </span>;
                                          }
                                        })()
                                      }
                                    </a>
                                    {' '}
                                    {
                                      this.canClusterUpgrade() ?
                                      <a onClick={this.showUpgradeModal} className='upgrade-available'>
                                        <i className='fa fa-info-circle' /> Upgrade available
                                      </a>
                                      :
                                      undefined
                                    }
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
                                </td>
                              </tr>
                              {instanceTypeOrVMSize}
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
                              {
                                this.props.cluster.kvm && this.props.cluster.kvm.port_mappings ?
                                <tr>
                                  <td>Ingress Ports</td>
                                  <td>
                                    <dl className="ingress-port-table">
                                      {this.props.cluster.kvm.port_mappings.reduce((acc, item, idx) => {
                                        return acc.concat([
                                          <dt key={`def-${idx}`}><code>{item.protocol}</code></dt>,
                                          <dd key={`term-${idx}`}>{item.port}</dd>
                                        ]);
                                      }, [])}
                                    </dl>
                                  </td>
                                </tr>
                                :
                                undefined
                              }
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
                    <ScaleClusterModal ref={(s) => {this.scaleClusterModal = s;}}
                                       cluster={this.props.cluster}
                                       user={this.props.user}/>

                    {
                      this.props.targetRelease ?
                      <UpgradeClusterModal ref={(s) => {this.upgradeClusterModal = s;}}
                                           cluster={this.props.cluster}
                                           release={this.props.release}
                                           targetRelease={this.props.targetRelease} />
                      :
                      undefined
                    }
                  </div>
                  {
                    this.props.release ?
                    <ReleaseDetailsModal ref={(r) => {this.releaseDetailsModal = r;}}
                                         releases={[this.props.release]} />
                    : undefined
                  }
                </div>
              :
                undefined
              }
            </DocumentTitle>
          </Breadcrumb>
        </Breadcrumb>
      </Breadcrumb>
    );
  }
}

ClusterDetail.contextTypes = {
  router: PropTypes.object
};


ClusterDetail.propTypes = {
  clusterActions: PropTypes.object,
  cluster: PropTypes.object,
  clusterId: PropTypes.string,
  dispatch: PropTypes.func,
  organizationId: PropTypes.string,
  releaseActions: PropTypes.object,
  release: PropTypes.object,
  provider: PropTypes.string,
  targetRelease: PropTypes.object,
  user: PropTypes.object,
};

function mapStateToProps(state, ownProps) {
  var cluster = state.entities.clusters.items[ownProps.match.params.clusterId];
  let release;
  let targetReleaseVersion;

  if (cluster) {
    if (cluster.release_version && cluster.release_version !== '') {
      release = state.entities.releases.items[cluster.release_version];
    }

    let activeReleases = _.filter(state.entities.releases.items, (x) => {
      return x.active;
    });

    let availableVersions = _.map(activeReleases, (x) => {
      return x.version;
    }).sort(cmp);

    // Guard against the release version of this cluster not being in the /v4/releases/
    // response.
    // This will ensure that Happa can calculate the target version for upgrade
    // correctly.
    if (availableVersions.indexOf(cluster.release_version) === -1) {
      availableVersions.push(cluster.release_version);
      availableVersions.sort(cmp);
    }

    if (availableVersions.length > availableVersions.indexOf(cluster.release_version)) {
      targetReleaseVersion = availableVersions[availableVersions.indexOf(cluster.release_version) + 1];
    }
  }

  return {
    organizationId: ownProps.match.params.orgId,
    cluster: cluster,
    clusterId: ownProps.match.params.clusterId,
    provider: state.app.info.general.provider,
    release: release,
    targetRelease: state.entities.releases.items[targetReleaseVersion],
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
