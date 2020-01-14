import styled from '@emotion/styled';
import {
  batchedClusterDetailView,
  batchedRefreshClusterDetailView,
} from 'actions/batchedActions';
import * as clusterActions from 'actions/clusterActions';
import * as nodePoolActions from 'actions/nodePoolActions';
import * as releaseActions from 'actions/releaseActions';
import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PageVisibilityTracker from 'lib/pageVisibilityTracker';
import PropTypes from 'prop-types';
import React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import { connect } from 'react-redux';
import ReactTimeout from 'react-timeout';
import { bindActionCreators } from 'redux';
import cmp from 'semver-compare';
import { Providers } from 'shared/constants';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import LoadingOverlay from 'UI/LoadingOverlay';
import ViewAndEditName from 'UI/ViewEditName';
import { getNumberOfNodes } from 'utils/clusterUtils';

import ClusterApps from './ClusterApps';
import KeyPairs from './KeyPairs';
import ScaleClusterModal from './ScaleClusterModal';
import Tabs from './Tabs';
import UpgradeClusterModal from './UpgradeClusterModal';
import V4ClusterDetailTable from './V4ClusterDetailTable';
import V5ClusterDetailTable from './V5ClusterDetailTable';

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
    errorLoadingApps: false,
  };

  loadDataInterval = null;

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
    this.loadDataInterval = this.props.setInterval(
      this.refreshClusterData,
      // eslint-disable-next-line no-magic-numbers
      3 * 1000 // 30 seconds
    );
  };

  loadDetails = () => {
    const { cluster, clusterId, organizationId, dispatch } = this.props;

    if (typeof cluster === 'undefined') {
      dispatch(push(`/organizations/${organizationId}`));

      new FlashMessage(
        `Cluster <code>${clusterId}</code> not found`,
        messageType.ERROR,
        messageTTL.FOREVER,
        'Please make sure the Cluster ID is correct and that you have access to the organization that it belongs to.'
      );

      return;
    }

    dispatch(
      batchedClusterDetailView(
        organizationId,
        cluster.id,
        this.props.isNodePoolsCluster
      )
    );
  };

  refreshClusterData = () => {
    this.props.dispatch(
      batchedRefreshClusterDetailView(
        this.props.cluster.id,
        this.props.isNodePoolsCluster
      )
    );
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

  showUpgradeModal = () => {
    this.upgradeClusterModal.show();
  };

  clusterName() {
    if (this.props.cluster) {
      return this.props.cluster.name;
    }

    return 'Not found';
  }

  // Determine whether the current cluster can be upgraded
  canClusterUpgrade() {
    // cluster must have a release_version
    if (this.props.cluster.release_version === '') return false;

    // a target release to upgrade to must be defined
    if (Boolean(this.props.targetRelease) !== true) {
      return false;
    }

    return true;
  }

  // Determine whether the cluster can be scaled
  canClusterScale() {
    if (
      !Object.keys(this.props.cluster).includes('status') ||
      this.props.cluster.status === null
    ) {
      // Cluster doesn't have status object yet.
      return false;
    }

    if (this.props.provider === Providers.AWS) {
      return true;
    }

    if (this.props.provider === Providers.KVM) {
      return true;
    }

    // on Azure, release version must be >= 1.0.0
    if (
      this.props.provider === Providers.AZURE &&
      cmp(this.props.cluster.release_version, '1.0.0') !== -1
    ) {
      return true;
    }

    return false;
  }

  getDesiredNumberOfNodes() {
    // Desired number of nodes only makes sense with auto-scaling and that is
    // only available on AWS starting from release 6.3.0 onwards.
    if (
      this.props.provider !== Providers.AWS ||
      cmp(this.props.cluster.release_version, '6.2.99') !== 1
    ) {
      return null;
    }

    // Is AWSConfig.Status present yet?
    if (
      Object.keys(this.props.cluster).includes('status') &&
      this.props.cluster.status !== null
    ) {
      return this.props.cluster.status.cluster.scaling.desiredCapacity;
    }

    return 0; // if we return null no value is rendered in AWS v4 cluster view
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
          clusterActions.clusterPatch(
            this.props.cluster,
            { name: value },
            this.props.isNodePoolsCluster
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
      isNodePoolsCluster,
      nodePools,
      provider,
      release,
      targetRelease,
      region,
      loadingCluster,
      loadingNodePools,
    } = this.props;

    return (
      <>
        <LoadingOverlay loading={loadingCluster || loadingNodePools} />

        {!loadingCluster && (
          <DocumentTitle title={`Cluster Details | ${this.clusterName()}`}>
            <WrapperDiv
              className='cluster-details'
              data-testid='cluster-details-view'
            >
              <div className='row' style={{ marginBottom: '30px' }}>
                <div className='col-sm-12 col-md-7 col-9'>
                  <h1 style={{ marginLeft: '-10px' }}>
                    <ClusterIDLabel clusterID={cluster.id} copyEnabled />{' '}
                    <ViewAndEditName
                      entity={cluster}
                      entityType='cluster'
                      onSubmit={this.editClusterName}
                    />{' '}
                  </h1>
                </div>
              </div>
              <div className='row'>
                <div className='col-12'>
                  <Tabs>
                    <Tab eventKey={1} title='General'>
                      {isNodePoolsCluster ? (
                        <V5ClusterDetailTable
                          accessCluster={this.accessCluster}
                          canClusterUpgrade={this.canClusterUpgrade()}
                          cluster={cluster}
                          credentials={credentials}
                          nodePools={nodePools}
                          provider={provider}
                          release={release}
                          region={region}
                          showUpgradeModal={this.showUpgradeModal}
                          workerNodesDesired={this.getDesiredNumberOfNodes()}
                        />
                      ) : (
                        <V4ClusterDetailTable
                          accessCluster={this.accessCluster}
                          canClusterUpgrade={this.canClusterUpgrade()}
                          cluster={cluster}
                          credentials={credentials}
                          provider={provider}
                          release={release}
                          region={region}
                          showScalingModal={this.showScalingModal}
                          showUpgradeModal={this.showUpgradeModal}
                          workerNodesDesired={this.getDesiredNumberOfNodes()}
                          workerNodesRunning={getNumberOfNodes(cluster)}
                        />
                      )}

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
                              cluster
                            )}
                          >
                            <i className='fa fa-delete' /> Delete Cluster
                          </Button>
                        </div>
                      </div>
                    </Tab>
                    <Tab eventKey={2} title='Key Pairs'>
                      <LoadingOverlay loading={this.props.loadingCluster}>
                        <KeyPairs cluster={cluster} />
                      </LoadingOverlay>
                    </Tab>
                    <Tab eventKey={3} title='Apps'>
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
                    </Tab>
                  </Tabs>
                </div>
              </div>
              {!isNodePoolsCluster && (
                <ScaleClusterModal
                  cluster={cluster}
                  provider={provider}
                  ref={s => {
                    this.scaleClusterModal = s;
                  }}
                  workerNodesDesired={this.getDesiredNumberOfNodes()}
                  workerNodesRunning={getNumberOfNodes(cluster)}
                />
              )}

              {targetRelease && (
                <UpgradeClusterModal
                  cluster={cluster}
                  ref={s => {
                    this.upgradeClusterModal = s;
                  }}
                  release={release}
                  targetRelease={targetRelease}
                />
              )}
            </WrapperDiv>
          </DocumentTitle>
        )}
      </>
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
  isNodePoolsCluster: PropTypes.bool,
  nodePools: PropTypes.object,
  organizationId: PropTypes.string,
  releaseActions: PropTypes.object,
  release: PropTypes.object,
  provider: PropTypes.string,
  region: PropTypes.string,
  setInterval: PropTypes.func,
  targetRelease: PropTypes.object,
  user: PropTypes.object,
  loadingCluster: PropTypes.bool,
  loadingNodePools: PropTypes.bool,
};

function mapStateToProps(state) {
  return {
    loadingCluster: state.loadingFlags.CLUSTER_LOAD_DETAILS,
    loadingNodePools: state.loadingFlags.NODEPOOLS_LOAD,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
    releaseActions: bindActionCreators(releaseActions, dispatch),
    nodePoolActions: bindActionCreators(nodePoolActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReactTimeout(ClusterDetailView));
