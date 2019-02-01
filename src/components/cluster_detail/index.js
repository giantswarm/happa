'use strict';

import _ from 'underscore';
import { bindActionCreators } from 'redux';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { push } from 'connected-react-router';
import cmp from 'semver-compare';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

import { flashAdd } from '../../actions/flashMessageActions';
import { organizationCredentialsLoad } from '../../actions/organizationActions';
import * as clusterActions from '../../actions/clusterActions';
import * as releaseActions from '../../actions/releaseActions';

import Button from '../shared/button';
import ClusterIDLabel from '../shared/cluster_id_label';
import ClusterKeyPairs from './key_pairs';
import ClusterDetailTable from './cluster_detail_table';
import ClusterApps from './cluster_apps';
import ScaleClusterModal from './scale_cluster_modal';
import UpgradeClusterModal from './upgrade_cluster_modal';

class ClusterDetail extends React.Component {
  state = {
    loading: true,
  };

  constructor(props) {
    super(props);

    if (props.cluster === undefined) {
      props.dispatch(push('/organizations/' + props.organizationId));

      props.dispatch(
        flashAdd({
          message: (
            <div>
              <b>Cluster &quot;{props.clusterId}&quot; not found.</b>
              <br />
              Please make sure the Cluster ID is correct and that you have
              access to the organization that it belongs to.
            </div>
          ),
          class: 'info',
          ttl: 6000,
        })
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

  showDeleteClusterModal(cluster) {
    this.props.clusterActions.clusterDelete(cluster);
  }

  showScalingModal = () => {
    this.scaleClusterModal.getWrappedInstance().reset();
    this.scaleClusterModal.getWrappedInstance().show();
  };

  showUpgradeModal = () => {
    this.upgradeClusterModal.getWrappedInstance().show();
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
    this.props.clusterActions.clusterSelect(this.props.cluster.id);
    this.props.dispatch(push('/getting-started/'));
  };

  render() {
    return (
      <div>
        {this.state.loading === false ? (
          <Breadcrumb
            data={{
              title: this.props.cluster.id,
              pathname:
                '/organizations/' +
                this.props.cluster.owner +
                '/clusters/' +
                this.props.cluster.id,
            }}
          >
            <Breadcrumb
              data={{
                title: this.props.cluster.owner.toUpperCase(),
                pathname: '/organizations/' + this.props.cluster.owner,
              }}
            >
              <Breadcrumb
                data={{ title: 'ORGANIZATIONS', pathname: '/organizations/' }}
              >
                <DocumentTitle
                  title={
                    'Cluster Details | ' + this.clusterName() + ' | Giant Swarm'
                  }
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
                            {this.props.cluster.name}{' '}
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
                              GET STARTED
                            </Button>
                            {this.canClusterScale() ? (
                              <Button onClick={this.showScalingModal}>
                                SCALE
                              </Button>
                            ) : (
                              undefined
                            )}

                            {this.canClusterUpgrade() ? (
                              <Button onClick={this.showUpgradeModal}>
                                UPGRADE
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
                            All workloads on this cluster will be terminated.
                            Data stored on the worker nodes will be lost. There
                            is no way to undo this action.
                          </p>
                          <Button
                            bsStyle='danger'
                            onClick={this.showDeleteClusterModal.bind(
                              this,
                              this.props.cluster
                            )}
                          >
                            Delete Cluster
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
              </Breadcrumb>
            </Breadcrumb>
          </Breadcrumb>
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

ClusterDetail.contextTypes = {
  router: PropTypes.object,
};

ClusterDetail.propTypes = {
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

function mapStateToProps(state, ownProps) {
  var cluster = state.entities.clusters.items[ownProps.match.params.clusterId];
  let release;
  let targetReleaseVersion;

  if (cluster) {
    if (cluster.release_version && cluster.release_version !== '') {
      release = state.entities.releases.items[cluster.release_version];
    }

    let activeReleases = _.filter(state.entities.releases.items, x => {
      return x.active;
    });

    let availableVersions = activeReleases.map(x => x.version).sort(cmp);

    // Guard against the release version of this cluster not being in the /v4/releases/
    // response.
    // This will ensure that Happa can calculate the target version for upgrade
    // correctly.
    if (availableVersions.indexOf(cluster.release_version) === -1) {
      availableVersions.push(cluster.release_version);
      availableVersions.sort(cmp);
    }

    if (
      availableVersions.length >
      availableVersions.indexOf(cluster.release_version)
    ) {
      targetReleaseVersion =
        availableVersions[
          availableVersions.indexOf(cluster.release_version) + 1
        ];
    }
  }

  return {
    credentials: state.entities.credentials,
    organizationId: ownProps.match.params.orgId,
    cluster: cluster,
    clusterId: ownProps.match.params.clusterId,
    provider: state.app.info.general.provider,
    release: release,
    targetRelease: state.entities.releases.items[targetReleaseVersion],
    user: state.app.loggedInUser,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
    releaseActions: bindActionCreators(releaseActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ClusterDetail);
