import * as clusterActions from 'actions/clusterActions';
import * as releaseActions from 'actions/releaseActions';
import { bindActionCreators } from 'redux';
import { clusterPatch } from 'actions/clusterActions';
import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { getNumberOfNodes } from 'utils/cluster_utils';
import { organizationCredentialsLoad } from 'actions/organizationActions';
import { push } from 'connected-react-router';
import Button from 'UI/button';
import ClusterApps from './cluster_apps';
import ClusterDetailNodePoolsTable from './cluster_detail_node_pools_table';
import ClusterDetailTable from './cluster_detail_table';
import ClusterIDLabel from 'UI/cluster_id_label';
import ClusterKeyPairs from './key_pairs';
import cmp from 'semver-compare';
import DocumentTitle from 'react-document-title';
import LoadingOverlay from 'UI/loading_overlay';
import PageVisibilityTracker from 'lib/page_visibility_tracker';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTimeout from 'react-timeout';
import ScaleClusterModal from './scale_cluster_modal';
import ScaleNodePoolModal from './scale_node_pool_modal';
import styled from '@emotion/styled';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from './tabs';
import UpgradeClusterModal from './upgrade_cluster_modal';
import ViewAndEditName from 'UI/view_edit_name';

const WrapperDiv = styled.div`
  h2 {
    font-weight: 400;
    font-size: 22px;
    margin: 0 0 15px;
  }
  p {
    margin: 0 0 20px;
    line-height: 1.2;
  }
`;

class ClusterDetailView extends React.Component {
  state = {
    loading: true,
    errorLoadingApps: false,
  };

  componentDidMount() {
    this.registerRefreshInterval();
    this.visibilityTracker = new PageVisibilityTracker();
    this.visibilityTracker.addEventListener(this.handleVisibilityChange);
    this.loadDetails();
  }

  componentWillUnmount() {
    this.props.clearInterval(this.loadDataInterval);
    this.visibilityTracker.removeEventListener(this.handleVisibilityChange);
  }

  registerRefreshInterval = () => {
    var refreshInterval = 30 * 1000; // 30 seconds
    this.loadDataInterval = this.props.setInterval(
      this.refreshClusterData,
      refreshInterval
    );
  };

  loadDetails = () => {
    const {
      cluster,
      clusterId,
      clusterActions,
      organizationId,
      dispatch,
      releaseActions,
    } = this.props;

    if (cluster === undefined) {
      dispatch(push('/organizations/' + organizationId));

      new FlashMessage(
        'Cluster <code>' + clusterId + '</code> not found',
        messageType.ERROR,
        messageTTL.FOREVER,
        'Please make sure the Cluster ID is correct and that you have access to the organization that it belongs to.'
      );

      return;
    }

    dispatch(organizationCredentialsLoad(organizationId));

    releaseActions
      .loadReleases()
      .then(() => {
        return clusterActions.clusterLoadDetails(cluster.id);
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
      })
      .then(() => {
        return clusterActions.clusterLoadApps(cluster.id);
      })
      .then(() => {
        this.setState({
          errorLoadingApps: false,
        });
      })
      .catch(() => {
        this.setState({
          errorLoadingApps: true,
        });
      });
  };

  refreshClusterData = () => {
    this.props.clusterActions.clusterLoadDetails(this.props.cluster.id);
  };

  handleVisibilityChange = () => {
    if (!this.visibilityTracker.isVisible()) {
      this.props.clearInterval(this.loadDataInterval);
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

  showNodePoolScalingModal = nodePool => {
    this.scaleNodePoolModal.reset();
    this.scaleNodePoolModal.show();
    this.scaleNodePoolModal.setNodePool(nodePool);
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
    // cluster must have a release_version
    if (this.props.cluster.release_version === '') return false;

    // a target release to upgrade to must be defined
    if (!!this.props.targetRelease !== true) {
      return false;
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

  getDesiredNumberOfNodes() {
    // Desired number of nodes only makes sense with auto-scaling and that is
    // only available on AWS starting from release 6.3.0 onwards.
    if (
      this.props.provider != 'aws' ||
      cmp(this.props.cluster.release_version, '6.2.99') != 1
    ) {
      return null;
    }

    // Is AWSConfig.Status present yet?
    if (
      Object.keys(this.props.cluster).includes('status') &&
      this.props.cluster.status != null
    ) {
      return this.props.cluster.status.cluster.scaling.desiredCapacity;
    }
    return null;
  }

  accessCluster = () => {
    const { owner, id } = this.props.cluster;
    this.props.dispatch(
      push(`/organizations/${owner}/clusters/${id}/getting-started/`)
    );
  };

  editClusterName = value => {
    return new Promise((resolve, reject) => {
      this.props
        .dispatch(
          clusterPatch(
            this.props.cluster,
            { name: value },
            this.props.isNodePoolView
          )
        )
        .then(() => {
          new FlashMessage(
            'Succesfully edited cluster name.',
            messageType.SUCCESS,
            messageTTL.MEDIUM
          );
          resolve();
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  render() {
    const {
      cluster,
      credentials,
      dispatch,
      isNodePoolView,
      nodePools,
      provider,
      release,
      targetRelease,
      region,
    } = this.props;

    const { loading } = this.state;

    return (
      <LoadingOverlay loading={loading}>
        <DocumentTitle
          title={'Cluster Details | ' + this.clusterName() + ' | Giant Swarm'}
        >
          <WrapperDiv className='cluster-details'>
            <div className='row' style={{ marginBottom: '30px' }}>
              <div className='col-sm-12 col-md-7 col-9'>
                <h1 style={{ marginLeft: '-10px' }}>
                  <ClusterIDLabel clusterID={cluster.id} copyEnabled />{' '}
                  <ViewAndEditName
                    entity={cluster}
                    entityType='cluster'
                    onSubmit={this.editClusterName}
                  />{' '}
                  {loading ? (
                    <img
                      className='loader'
                      height='25px'
                      src='/images/loader_oval_light.svg'
                      width='25px'
                    />
                  ) : (
                    ''
                  )}
                </h1>
              </div>
              <div className='col-sm-12 col-md-5 col-3'>
                {!isNodePoolView && (
                  <>
                    <div
                      className='btn-group visible-xs-block visible-sm-block visible-md-block'
                      style={{ marginTop: 10 }}
                    >
                      <Button onClick={this.accessCluster}>
                        <i className='fa fa-start' /> GET STARTED
                      </Button>
                    </div>
                    <div className='pull-right btn-group visible-lg-block'>
                      <Button onClick={this.accessCluster}>
                        <i className='fa fa-start' /> GET STARTED
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className='row'>
              <div className='col-12'>
                <Tabs>
                  <Tab eventKey={1} title='General'>
                    {isNodePoolView ? (
                      <ClusterDetailNodePoolsTable
                        accessCluster={this.accessCluster}
                        canClusterUpgrade={this.canClusterUpgrade()}
                        cluster={cluster}
                        credentials={credentials}
                        nodePools={nodePools}
                        provider={provider}
                        release={release}
                        region={region}
                        showNodePoolScalingModal={this.showNodePoolScalingModal}
                        showUpgradeModal={this.showUpgradeModal}
                        workerNodesDesired={this.getDesiredNumberOfNodes()}
                      />
                    ) : (
                      <ClusterDetailTable
                        canClusterUpgrade={this.canClusterUpgrade()}
                        cluster={cluster}
                        credentials={credentials}
                        provider={provider}
                        release={release}
                        showScalingModal={this.showScalingModal}
                        showUpgradeModal={this.showUpgradeModal}
                        workerNodesDesired={this.getDesiredNumberOfNodes()}
                        workerNodesRunning={getNumberOfNodes(cluster)}
                      />
                    )}

                    <div className='row section cluster_delete col-12'>
                      <h2 className='table-label'>Delete Cluster</h2>
                      <p>
                        All workloads on this cluster will be terminated. Data
                        stored on the worker nodes will be lost. There is no way
                        to undo this action.
                      </p>
                      <Button
                        bsStyle='danger'
                        onClick={this.showDeleteClusterModal.bind(
                          this,
                          cluster
                        )}
                      >
                        <i className='fa fa-delete' /> Delete Cluster
                      </Button>
                    </div>
                  </Tab>
                  <Tab eventKey={2} title='Key Pairs'>
                    <ClusterKeyPairs cluster={cluster} />
                  </Tab>
                  <Tab eventKey={3} title='Apps'>
                    {release ? (
                      <ClusterApps
                        clusterId={this.props.clusterId}
                        dispatch={dispatch}
                        errorLoading={this.state.errorLoadingApps}
                        installedApps={cluster.apps}
                        release={release}
                        showInstalledAppsBlock={
                          Object.keys(this.props.catalogs.items).length > 0 &&
                          cluster.capabilities.canInstallApps
                        }
                      />
                    ) : (
                      <div className='well'>
                        We had some trouble loading this pane. Please come back
                        later or contact support in your slack channel or at{' '}
                        <a href='mailto:support@giantswarm.io'>
                          support@giantswarm.io
                        </a>
                        .
                      </div>
                    )}
                  </Tab>
                </Tabs>
              </div>
            </div>

            <ScaleClusterModal
              cluster={cluster}
              provider={provider}
              ref={s => {
                this.scaleClusterModal = s;
              }}
              workerNodesDesired={this.getDesiredNumberOfNodes()}
              workerNodesRunning={getNumberOfNodes(cluster)}
            />

            <ScaleNodePoolModal
              cluster={cluster}
              provider={provider}
              ref={s => {
                this.scaleNodePoolModal = s;
              }}
              workerNodesDesired={this.getDesiredNumberOfNodes()}
              workerNodesRunning={getNumberOfNodes(cluster)}
            />

            {targetRelease ? (
              <UpgradeClusterModal
                cluster={cluster}
                ref={s => {
                  this.upgradeClusterModal = s;
                }}
                release={release}
                targetRelease={targetRelease}
              />
            ) : (
              undefined
            )}
          </WrapperDiv>
        </DocumentTitle>
      </LoadingOverlay>
    );
  }
}

ClusterDetailView.contextTypes = {
  router: PropTypes.object,
};

ClusterDetailView.propTypes = {
  catalogs: PropTypes.object,
  clearInterval: PropTypes.func,
  clusterActions: PropTypes.object,
  cluster: PropTypes.object,
  clusterId: PropTypes.string,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  isNodePoolView: PropTypes.bool,
  nodePools: PropTypes.object,
  organizationId: PropTypes.string,
  releaseActions: PropTypes.object,
  release: PropTypes.object,
  provider: PropTypes.string,
  region: PropTypes.string,
  setInterval: PropTypes.func,
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
)(ReactTimeout(ClusterDetailView));
