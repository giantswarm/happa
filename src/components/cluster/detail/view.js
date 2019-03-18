'use strict';

import * as clusterActions from '../../../actions/clusterActions';
import * as releaseActions from '../../../actions/releaseActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  FlashMessage,
  messageTTL,
  messageType,
} from '../../../lib/flash_message';
import { organizationCredentialsLoad } from '../../../actions/organizationActions';
import { push } from 'connected-react-router';
import Button from '../../shared/button';
import ClusterApps from './cluster_apps';
import ClusterDetailTable from './cluster_detail_table';
import ClusterIDLabel from '../../shared/cluster_id_label';
import ClusterKeyPairs from './key_pairs';
import ClusterName from '../../shared/cluster_name';
import cmp from 'semver-compare';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';
import ScaleClusterModal from './scale_cluster_modal';
import UpgradeClusterModal from './upgrade_cluster_modal';

class ClusterDetailView extends React.Component {
  state = {
    loading: true,
  };

  constructor(props) {
    super(props);

    if (props.cluster === undefined) {
      props.dispatch(push('/organizations/' + props.organizationId));

      new FlashMessage(
        'Cluster <code>' + props.clusterId + '</code> not found',
        messageType.ERROR,
        messageTTL.FOREVER,
        'Please make sure the Cluster ID is correct and that you have access to the organization that it belongs to.'
      );
    } else {
      props.dispatch(organizationCredentialsLoad(props.organizationId));

      props.releaseActions
        .loadReleases()
        .then(() => {
          return props.clusterActions.clusterLoadDetails(props.cluster.id);
        })
        .then(() => {
          this.setState({
            loading: false,
          });
        })
        .catch(() => {
          this.setState({
            loading: 'failed',
          });
        });
    }
  }

  componentDidMount = () => {
    this.registerRefreshInterval();

    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      this.hidden = 'hidden';
      this.visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
      this.hidden = 'msHidden';
      this.visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
      this.hidden = 'webkitHidden';
      this.visibilityChange = 'webkitvisibilitychange';
    }

    if (
      typeof document.addEventListener === 'undefined' ||
      this.hidden === undefined
    ) {
      console.log(
        'This piece of code requires a browser that supports the Page Visibility API.'
      );
    } else {
      // Handle page visibility change
      document.addEventListener(
        this.visibilityChange,
        this.handleVisibilityChange,
        false
      );
    }
  };

  componentWillUnmount = () => {
    window.clearInterval(this.loadDataInterval);
    document.removeEventListener(
      this.visibilityChange,
      this.handleVisibilityChange,
      false
    );
  };

  registerRefreshInterval = () => {
    var refreshInterval = 30 * 1000; // 30 seconds
    this.loadDataInterval = window.setInterval(
      this.refreshClusterData,
      refreshInterval
    );
  };

  refreshClusterData = () => {
    this.props.clusterActions.clusterLoadDetails(this.props.cluster.id);
  };

  handleVisibilityChange = () => {
    if (document[this.hidden]) {
      window.clearInterval(this.loadDataInterval);
    } else {
      this.refreshClusterData();
      this.registerRefreshInterval();
    }
  };

  showDeleteClusterModal(cluster) {
    this.props.clusterActions.clusterDelete(cluster);
  }

  showScalingModal = () => {
    this.scaleClusterModal.reset();
    this.scaleClusterModal.show();
  };

  showUpgradeModal = () => {
    this.upgradeClusterModal.show();
  };

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

    // cluster must have a release_version
    if (this.props.cluster.release_version === '') return false;

    // a target release to upgrade to must be defined
    if (!!this.props.targetRelease !== true) {
      return false;
    }

    // cluster release_version must be >= 3 on AWS, >= 1 on Azure, >= 2.7.0 on KVM
    if (this.props.provider === 'aws') {
      if (cmp(this.props.cluster.release_version, '3.0.0') === -1) {
        return false;
      }
    } else if (this.props.provider === 'azure') {
      if (cmp(this.props.cluster.release_version, '1.0.0') === -1) {
        return false;
      }
    } else if (this.props.provider === 'kvm') {
      if (cmp(this.props.cluster.release_version, '2.7.0') === -1) {
        return false;
      }
    }

    return true;
  }

  // Determine whether the cluster can be scaled
  canClusterScale() {
    if (
      !Object.keys(this.props.cluster).includes('status') ||
      this.props.cluster.status == null
    ) {
      // Cluster doesn't have status object yet.
      return false;
    }

    if (this.props.provider === 'aws') {
      return true;
    }

    if (this.props.provider === 'kvm') {
      return true;
    }

    // on Azure, release version must be >= 1.0.0
    if (
      this.props.provider === 'azure' &&
      cmp(this.props.cluster.release_version, '1.0.0') !== -1
    ) {
      return true;
    }
  }

  accessCluster = () => {
    this.props.dispatch(
      push(
        '/organizations/' +
          this.props.cluster.owner +
          '/clusters/' +
          this.props.cluster.id +
          '/getting-started/'
      )
    );
  };

  render() {
    return (
      <div>
        {this.state.loading === false ? (
          <DocumentTitle
            title={'Cluster Details | ' + this.clusterName() + ' | Giant Swarm'}
          >
            <div>
              <div className='cluster-details'>
                <div className='row'>
                  <div className='col-7'>
                    <h1>
                      <ClusterIDLabel
                        clusterID={this.props.cluster.id}
                        copyEnabled
                      />{' '}
                      <ClusterName
                        id={this.props.cluster.id}
                        name={this.props.cluster.name}
                        dispatchFunc={this.props.dispatch}
                      />{' '}
                      {this.state.loading ? (
                        <img
                          className='loader'
                          width='25px'
                          height='25px'
                          src='/images/loader_oval_light.svg'
                        />
                      ) : (
                        ''
                      )}
                    </h1>
                  </div>
                  <div className='col-5'>
                    <div className='pull-right btn-group'>
                      <Button onClick={this.accessCluster}>
                        <i className='fa fa-start' /> GET STARTED
                      </Button>
                      {this.canClusterScale() ? (
                        <Button onClick={this.showScalingModal}>
                          <i className='fa fa-scale' /> SCALE
                        </Button>
                      ) : (
                        undefined
                      )}

                      {this.canClusterUpgrade() ? (
                        <Button onClick={this.showUpgradeModal}>
                          <i className='fa fa-version-upgrade' /> UPGRADE
                        </Button>
                      ) : (
                        undefined
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <ClusterDetailTable
                  canClusterUpgrade={this.canClusterUpgrade()}
                  showUpgradeModal={this.showUpgradeModal}
                  cluster={this.props.cluster}
                  provider={this.props.provider}
                  credentials={this.props.credentials}
                  release={this.props.release}
                />

                {this.props.release && (
                  <ClusterApps release={this.props.release} />
                )}

                <ClusterKeyPairs cluster={this.props.cluster} />

                <div className='row section cluster_delete col-12'>
                  <div className='row'>
                    <h3 className='table-label'>Delete This Cluster</h3>
                  </div>
                  <div className='row'>
                    <p>
                      All workloads on this cluster will be terminated. Data
                      stored on the worker nodes will be lost. There is no way
                      to undo this action.
                    </p>
                    <Button
                      bsStyle='danger'
                      onClick={this.showDeleteClusterModal.bind(
                        this,
                        this.props.cluster
                      )}
                    >
                      <i className='fa fa-delete' /> Delete Cluster
                    </Button>
                  </div>
                </div>
                <ScaleClusterModal
                  ref={s => {
                    this.scaleClusterModal = s;
                  }}
                  cluster={this.props.cluster}
                  provider={this.props.provider}
                />

                {this.props.targetRelease ? (
                  <UpgradeClusterModal
                    ref={s => {
                      this.upgradeClusterModal = s;
                    }}
                    cluster={this.props.cluster}
                    release={this.props.release}
                    targetRelease={this.props.targetRelease}
                  />
                ) : (
                  undefined
                )}
              </div>
            </div>
          </DocumentTitle>
        ) : (
          <div className='app-loading'>
            <div className='app-loading-contents'>
              <img className='loader' src='/images/loader_oval_light.svg' />
            </div>
          </div>
        )}
      </div>
    );
  }
}

ClusterDetailView.contextTypes = {
  router: PropTypes.object,
};

ClusterDetailView.propTypes = {
  clusterActions: PropTypes.object,
  cluster: PropTypes.object,
  clusterId: PropTypes.string,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  organizationId: PropTypes.string,
  releaseActions: PropTypes.object,
  release: PropTypes.object,
  provider: PropTypes.string,
  targetRelease: PropTypes.object,
  user: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
    releaseActions: bindActionCreators(releaseActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  undefined,
  mapDispatchToProps
)(ClusterDetailView);
