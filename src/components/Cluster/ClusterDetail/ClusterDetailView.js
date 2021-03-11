import DocumentTitle from 'components/shared/DocumentTitle';
import { push } from 'connected-react-router';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PageVisibilityTracker from 'lib/pageVisibilityTracker';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React from 'react';
import Tab from 'react-bootstrap/lib/Tab';
import { connect } from 'react-redux';
import ReactTimeout from 'react-timeout';
import { bindActionCreators } from 'redux';
import { Constants, Providers } from 'shared/constants';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import Tabs from 'shared/Tabs';
import {
  batchedClusterDetailView,
  batchedRefreshClusterDetailView,
} from 'stores/batchActions';
import * as clusterActions from 'stores/cluster/actions';
import { CLUSTER_LOAD_DETAILS_REQUEST } from 'stores/cluster/constants';
import {
  selectIsClusterAwaitingUpgrade,
  selectTargetRelease,
} from 'stores/cluster/selectors';
import {
  getNumberOfNodes,
  isClusterCreating,
  isClusterUpdating,
} from 'stores/cluster/utils';
import { selectLoadingFlagByIdAndAction } from 'stores/entityloading/selectors';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
import { getLoggedInUser, getUserIsAdmin } from 'stores/main/selectors';
import * as nodePoolActions from 'stores/nodepool/actions';
import { NODEPOOL_MULTIPLE_LOAD_REQUEST } from 'stores/nodepool/constants';
import { selectNodePools } from 'stores/nodepool/selectors';
import { getAllReleases } from 'stores/releases/selectors';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import LoadingOverlay from 'UI/Display/Loading/LoadingOverlay';
import ViewAndEditName from 'UI/Inputs/ViewEditName';
import Section from 'UI/Layout/Section';
import Well from 'UI/Layout/Well';
import { memoize } from 'underscore';

import ClusterApps from './ClusterApps';
import Ingress from './Ingress/Ingress';
import KeyPairs from './KeyPairs';
import ScaleClusterModal from './ScaleClusterModal';
import UpgradeClusterModal from './UpgradeClusterModal';
import V4ClusterDetailTable from './V4ClusterDetailTable';
import V5ClusterDetailTable from './V5ClusterDetailTable';

const Disclaimer = styled.p`
  margin: 0 0 20px;
  line-height: 1.2;
`;

const NotReadyNotice = styled(Well)`
  background-color: ${({ theme }) =>
    theme.colors.flashMessages.info.background};
  color: ${({ theme }) => theme.colors.flashMessages.info.text};
  border: 1px solid ${({ theme }) => theme.colors.flashMessages.info.border};
  margin: ${({ theme }) => theme.spacingPx * 6}px 0;
`;

class ClusterDetailView extends React.Component {
  state = {
    targetRelease: null,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      prevState.targetRelease === null &&
      nextProps.defaultTargetRelease !== null
    ) {
      return { targetRelease: nextProps.defaultTargetRelease };
    }

    return null;
  }

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
      30 * 1000 // 30 seconds
    );
  };

  // It is not in user orgs or it has been deleted.
  doesNotExist = (isDeleted) => {
    const { cluster, dispatch } = this.props;
    const clusterID = cluster?.id ?? '';

    const text = isDeleted
      ? 'This cluster has been deleted'
      : 'Please make sure the Cluster ID is correct and that you have access to the organization that it belongs to.';

    new FlashMessage(
      `Cluster <code>${clusterID}</code> not found`,
      messageType.ERROR,
      messageTTL.FOREVER,
      text
    );

    this.props.clearInterval(this.loadDataInterval);

    dispatch(push(MainRoutes.Home));
  };

  loadDetails = () => {
    const { cluster, dispatch } = this.props;

    if (typeof cluster === 'undefined' || cluster.delete_date) {
      this.doesNotExist(Boolean(cluster?.delete_date));
    }

    if (cluster) {
      dispatch(
        batchedClusterDetailView(
          cluster.owner,
          cluster.id,
          this.props.isV5Cluster
        )
      );
    }
  };

  refreshClusterData = () => {
    const { cluster, dispatch } = this.props;

    if (typeof cluster === 'undefined' || cluster.delete_date) {
      this.doesNotExist(Boolean(cluster?.delete_date));
    }

    if (cluster) {
      dispatch(batchedRefreshClusterDetailView(cluster.id));
    }
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

  // Determine whether the cluster can be scaled
  canClusterScale() {
    if (
      !Object.keys(this.props.cluster).includes('status') ||
      this.props.cluster.status === null
    ) {
      // Cluster doesn't have status object yet.
      return false;
    }

    return true;
  }

  getDesiredNumberOfNodes() {
    // Desired number of nodes only makes sense with auto-scaling and that is
    // only available on AWS starting from release 6.3.0 onwards.
    if (this.props.provider !== Providers.AWS) {
      return null;
    }

    // Is AWSConfig.Status present yet?
    if (
      Object.keys(this.props.cluster).includes('status') &&
      this.props.cluster.status
    ) {
      return this.props.cluster.status.cluster.scaling.desiredCapacity;
    }

    return 0; // if we return null no value is rendered in AWS v4 cluster view
  }

  accessCluster = () => {
    const { owner, id } = this.props.cluster;
    const clusterGuideOverviewPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.Overview,
      {
        orgId: owner,
        clusterId: id,
      }
    );

    this.props.dispatch(push(clusterGuideOverviewPath));
  };

  editClusterName = (value) => {
    try {
      this.props.dispatch(
        clusterActions.clusterPatch(this.props.cluster, { name: value })
      );
    } catch (err) {
      ErrorReporter.getInstance().notify(err);
    }
  };

  /**
   * Get the paths for all tabs
   * @param clusterID {string} - The current cluster's ID
   * @param clusterOwner {string} - The current cluster's organization
   * @returns {Record<OrganizationsRoutes.Clusters.Detail, string>}
   */
  getPathsForTabs = memoize((clusterID, clusterOwner) => {
    const result = Object.entries(OrganizationsRoutes.Clusters.Detail).reduce(
      (acc, [name, path]) => {
        acc[name] = RoutePath.createUsablePath(path, {
          clusterId: clusterID,
          orgId: clusterOwner,
        });

        return acc;
      },
      {}
    );

    return result;
  });

  setTargetRelease = (newReleaseVersion) => {
    const newRelease = this.props.releases[newReleaseVersion];
    if (newRelease) {
      this.setState({ targetRelease: newRelease });
    }
  };

  cancelSetTargetRelease = () => {
    this.setTargetRelease(this.props.defaultTargetRelease);
  };

  render() {
    const {
      canClusterUpgrade,
      cluster,
      credentials,
      dispatch,
      isV5Cluster,
      provider,
      releases,
      region,
      loadingNodePools,
      loadingCluster,
      isAdmin,
      clusterIsAwaitingUpgrade,
    } = this.props;

    const loading = loadingNodePools || loadingCluster;

    if (!cluster) return null;
    const { id, owner, release_version } = cluster;
    const release = releases[release_version] ?? null;
    const tabsPaths = this.getPathsForTabs(id, owner);

    const clusterIsCreating = isClusterCreating(cluster);
    const clusterIsUpdating =
      isClusterUpdating(cluster) || clusterIsAwaitingUpgrade;

    return (
      <DocumentTitle title={`Cluster Details | ${this.clusterName()}`}>
        <LoadingOverlay loading={loading}>
          <div data-testid='cluster-details-view'>
            <h1>
              <ClusterIDLabel clusterID={id} copyEnabled />{' '}
              <ViewAndEditName
                value={cluster.name}
                typeLabel='cluster'
                onSave={this.editClusterName}
              />{' '}
            </h1>
            {(clusterIsUpdating || clusterIsCreating) && (
              <SlideTransition in={true} appear={true} direction='down'>
                <NotReadyNotice>
                  <i className='fa fa-info' /> This cluster is currently being{' '}
                  {clusterIsCreating ? 'created' : 'updated'}. During this time,
                  some operations are disabled or may not work as expected.
                </NotReadyNotice>
              </SlideTransition>
            )}
            <Tabs useRoutes={true}>
              <Tab eventKey={tabsPaths.Home} title='General'>
                {isV5Cluster ? (
                  <V5ClusterDetailTable
                    accessCluster={this.accessCluster}
                    canClusterUpgrade={canClusterUpgrade}
                    cluster={cluster}
                    credentials={credentials}
                    provider={provider}
                    release={release}
                    region={region}
                    isAdmin={isAdmin}
                    releases={releases}
                    showUpgradeModal={this.showUpgradeModal}
                    setUpgradeVersion={this.setTargetRelease}
                    workerNodesDesired={this.getDesiredNumberOfNodes()}
                    clusterIsCreating={clusterIsCreating}
                    clusterIsUpdating={clusterIsUpdating}
                  />
                ) : (
                  <V4ClusterDetailTable
                    accessCluster={this.accessCluster}
                    canClusterUpgrade={canClusterUpgrade}
                    cluster={cluster}
                    credentials={credentials}
                    provider={provider}
                    release={release}
                    region={region}
                    isAdmin={isAdmin}
                    releases={releases}
                    showScalingModal={this.showScalingModal}
                    setUpgradeVersion={this.setTargetRelease}
                    showUpgradeModal={this.showUpgradeModal}
                    workerNodesDesired={this.getDesiredNumberOfNodes()}
                  />
                )}

                <Section title='Delete This Cluster' flat>
                  <>
                    <Disclaimer>
                      All workloads on this cluster will be terminated. Data
                      stored on the worker nodes will be lost. There is no way
                      to undo this action.
                    </Disclaimer>
                    <Button
                      bsStyle='danger'
                      onClick={this.showDeleteClusterModal.bind(this, cluster)}
                    >
                      <i className='fa fa-delete' /> Delete Cluster
                    </Button>
                  </>
                </Section>
              </Tab>
              <Tab eventKey={tabsPaths.KeyPairs} title='Key Pairs'>
                <LoadingOverlay loading={this.props.loadingCluster}>
                  <KeyPairs cluster={cluster} />
                </LoadingOverlay>
              </Tab>
              <Tab eventKey={tabsPaths.Apps} title='Apps'>
                <ClusterApps
                  clusterId={id}
                  dispatch={dispatch}
                  installedApps={cluster.apps}
                  release={release}
                  showInstalledAppsBlock={
                    Object.keys(this.props.catalogs.items).length > 0
                  }
                  hasOptionalIngress={cluster.capabilities.hasOptionalIngress}
                />
              </Tab>
              <Tab eventKey={tabsPaths.Ingress} title='Ingress'>
                <Ingress
                  cluster={cluster}
                  provider={provider}
                  k8sEndpoint={cluster.api_endpoint}
                  kvmTCPHTTPPort={Constants.KVM_INGRESS_TCP_HTTP_PORT}
                  kvmTCPHTTPSPort={Constants.KVM_INGRESS_TCP_HTTPS_PORT}
                />
              </Tab>
            </Tabs>
            {!isV5Cluster && (
              <ScaleClusterModal
                cluster={cluster}
                provider={provider}
                ref={(s) => {
                  this.scaleClusterModal = s;
                }}
                workerNodesDesired={this.getDesiredNumberOfNodes()}
                workerNodesRunning={getNumberOfNodes(cluster)}
              />
            )}

            <UpgradeClusterModal
              cluster={cluster}
              ref={(s) => {
                this.upgradeClusterModal = s;
              }}
              release={release}
              targetRelease={this.state.targetRelease}
            />
          </div>
        </LoadingOverlay>
      </DocumentTitle>
    );
  }
}

ClusterDetailView.contextTypes = {
  router: PropTypes.object,
};

ClusterDetailView.propTypes = {
  cluster: PropTypes.object,

  canClusterUpgrade: PropTypes.bool,
  catalogs: PropTypes.object,
  clearInterval: PropTypes.func,
  clusterActions: PropTypes.object,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  isV5Cluster: PropTypes.bool,
  releases: PropTypes.object,
  defaultTargetRelease: PropTypes.object,
  provider: PropTypes.string,
  region: PropTypes.string,
  setInterval: PropTypes.func,
  loadingCluster: PropTypes.bool,
  loadingNodePools: PropTypes.bool,
  isAdmin: PropTypes.bool,
  clusterIsAwaitingUpgrade: PropTypes.bool,
};

function mapStateToProps(state, props) {
  const clusterID = props.cluster?.id;
  const defaultTargetReleaseVersion = selectTargetRelease(state, props.cluster);

  return {
    releases: getAllReleases(state),
    defaultTargetRelease:
      state.entities.releases.items[defaultTargetReleaseVersion] ?? null,
    isV5Cluster: state.entities.clusters.v5Clusters.includes(clusterID),
    credentials: state.entities.organizations.credentials,
    catalogs: state.entities.catalogs,
    nodePools: selectNodePools(state),
    provider: state.main.info.general.provider,
    user: getLoggedInUser(state),
    region: state.main.info.general.datacenter,
    isAdmin: getUserIsAdmin(state),
    clusterIsAwaitingUpgrade: selectIsClusterAwaitingUpgrade(clusterID ?? '')(
      state
    ),
    loadingNodePools: selectLoadingFlagByAction(
      state,
      NODEPOOL_MULTIPLE_LOAD_REQUEST
    ),
    // This looks for this specific cluster to be loaded.
    loadingCluster: selectLoadingFlagByIdAndAction(
      state,
      props.cluster?.id,
      CLUSTER_LOAD_DETAILS_REQUEST
    ),
  };
}

function mapDispatchToProps(dispatch) {
  return {
    clusterActions: bindActionCreators(clusterActions, dispatch),
    nodePoolActions: bindActionCreators(nodePoolActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReactTimeout(ClusterDetailView));
