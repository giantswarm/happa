import * as clusterActions from 'actions/clusterActions';
import * as releaseActions from 'actions/releaseActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { organizationCredentialsLoad } from 'actions/organizationActions';
import { push } from 'connected-react-router';
import Button from 'UI/button';
import ClusterApps from './cluster_apps';
import ClusterDetailNodePoolsTable from './cluster_detail_node_pools_table';
import ClusterDetailTable from './cluster_detail_table';
import ClusterIDLabel from 'UI/cluster_id_label';
import ClusterKeyPairs from './key_pairs';
import ClusterName from 'UI/cluster_name';
import cmp from 'semver-compare';
import DocumentTitle from 'react-document-title';
import LoadingOverlay from 'UI/loading_overlay';
import PageVisibilityTracker from 'lib/page_visibility_tracker';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTimeout from 'react-timeout';
import ScaleClusterModal from './scale_cluster_modal';
import Tab from 'react-bootstrap/lib/Tab';
import Tabs from './tabs';
import UpgradeClusterModal from './upgrade_cluster_modal';

class ClusterDetailView extends React.Component {
  state = {
    loading: true,
    errorLoadingApps: false,
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
        })
        .then(() => {
          return props.clusterActions.clusterLoadApps(props.cluster.id);
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
    }

    this.visibilityTracker = new PageVisibilityTracker();
  }

  componentDidMount() {
    this.registerRefreshInterval();
    this.visibilityTracker.addEventListener(this.handleVisibilityChange);
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

  getNumberOfNodes() {
    if (
      Object.keys(this.props.cluster).includes('status') &&
      this.props.cluster.status != null
    ) {
      var nodes = this.props.cluster.status.cluster.nodes;
      if (nodes.length == 0) {
        return 0;
      }

      var workers = 0;
      nodes.forEach(node => {
        if (Object.keys(node).includes('labels')) {
          if (
            node.labels['role'] != 'master' &&
            node.labels['kubernetes.io/role'] != 'master'
          ) {
            workers++;
          }
        }
      });

      if (workers === 0) {
        // No node labels available? Fallback to assumption that one of the
        // nodes is master and rest are workers.
        workers = nodes.length - 1;
      }

      return workers;
    }
    return null;
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
      <LoadingOverlay loading={this.state.loading}>
        <DocumentTitle
          title={'Cluster Details | ' + this.clusterName() + ' | Giant Swarm'}
        >
          <div className='cluster-details'>
            <div className='row' style={{ marginBottom: '30px' }}>
              <div className='col-sm-12 col-md-7 col-9'>
                <h1 style={{ marginLeft: '-10px' }}>
                  <ClusterIDLabel
                    clusterID={this.props.cluster.id}
                    copyEnabled
                  />{' '}
                  <ClusterName
                    dispatchFunc={this.props.dispatch}
                    id={this.props.cluster.id}
                    name={this.props.cluster.name}
                  />{' '}
                  {this.state.loading ? (
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
                <div
                  className='btn-group visible-xs-block visible-sm-block visible-md-block'
                  style={{ marginTop: 10 }}
                >
                  {!this.props.isNodePoolView && (
                    <Button onClick={this.accessCluster}>
                      <i className='fa fa-start' /> GET STARTED
                    </Button>
                  )}
                </div>
                <div className='pull-right btn-group visible-lg-block'>
                  <Button onClick={this.accessCluster}>
                    <i className='fa fa-start' /> GET STARTED
                  </Button>
                </div>
              </div>
            </div>
            <div className='row'>
              <div className='col-12'>
                <Tabs>
                  <Tab eventKey={1} title='General'>
                    {this.props.isNodePoolView ? (
                      <ClusterDetailNodePoolsTable />
                    ) : (
                      <ClusterDetailTable
                        canClusterUpgrade={this.canClusterUpgrade()}
                        cluster={this.props.cluster}
                        credentials={this.props.credentials}
                        provider={this.props.provider}
                        release={this.props.release}
                        showScalingModal={this.showScalingModal}
                        showUpgradeModal={this.showUpgradeModal}
                        workerNodesDesired={this.getDesiredNumberOfNodes()}
                        workerNodesRunning={this.getNumberOfNodes()}
                      />
                    )}

                    <div className='row section cluster_delete col-12'>
                      <div className='row'>
                        <h3 className='table-label'>Delete This Cluster</h3>
                      </div>
                      <div className='row'>
                        <p>
                          All workloads on this cluster will be terminated. Data
                          stored on the worker nodes will be lost. There is no
                          way to undo this action.
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
                  </Tab>
                  <Tab eventKey={2} title='Key Pairs'>
                    <ClusterKeyPairs cluster={this.props.cluster} />
                  </Tab>
                  <Tab eventKey={3} title='Apps'>
                    {this.props.release ? (
                      <ClusterApps
                        clusterId={this.props.clusterId}
                        dispatch={this.props.dispatch}
                        errorLoading={this.state.errorLoadingApps}
                        installedApps={this.props.cluster.apps}
                        release={this.props.release}
                        showInstalledAppsBlock={
                          Object.keys(this.props.catalogs.items).length > 0 &&
                          this.props.cluster.capabilities.canInstallApps
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
              cluster={this.props.cluster}
              provider={this.props.provider}
              ref={s => {
                this.scaleClusterModal = s;
              }}
              workerNodesDesired={this.getDesiredNumberOfNodes()}
              workerNodesRunning={this.getNumberOfNodes()}
            />

            {this.props.targetRelease ? (
              <UpgradeClusterModal
                cluster={this.props.cluster}
                ref={s => {
                  this.upgradeClusterModal = s;
                }}
                release={this.props.release}
                targetRelease={this.props.targetRelease}
              />
            ) : (
              undefined
            )}
          </div>
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
  organizationId: PropTypes.string,
  releaseActions: PropTypes.object,
  release: PropTypes.object,
  provider: PropTypes.string,
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
