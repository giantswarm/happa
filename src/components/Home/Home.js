import * as clusterActions from 'actions/clusterActions';
import * as nodePoolActions from 'actions/nodePoolActions';
import { batchedRefreshClusters } from 'actions/batchedActions';
import { bindActionCreators } from 'redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import _ from 'underscore';
import Button from 'UI/Button';
import ClusterDashboardItem from './ClusterDashboardItem';
import ClusterEmptyState from 'UI/ClusterEmptyState';
import DocumentTitle from 'components/shared/DocumentTitle';
import LoadingOverlay from 'UI/LoadingOverlay';
import moment from 'moment';
import PageVisibilityTracker from 'lib/pageVisibilityTracker';
import PropTypes from 'prop-types';
import React from 'react';
import ReactTimeout from 'react-timeout';

class Home extends React.Component {
  visibilityTracker = new PageVisibilityTracker();

  componentDidMount() {
    this.registerRefreshInterval();
    this.visibilityTracker.addEventListener(this.handleVisibilityChange);
  }

  componentWillUnmount() {
    this.visibilityTracker.removeEventListener(this.handleVisibilityChange);
    this.props.clearInterval(this.refreshInterval);
  }

  /**
   * Load clusters list periodically
   */
  registerRefreshInterval = () => {
    var refreshIntervalDuration = 30 * 1000; // 30 seconds
    this.refreshInterval = window.setInterval(
      this.refreshClustersList,
      refreshIntervalDuration
    );
  };

  refreshClustersList = () => {
    this.props.dispatch(batchedRefreshClusters());
  };

  handleVisibilityChange = () => {
    if (!this.visibilityTracker.isVisible()) {
      this.props.clearInterval(this.refreshInterval);
    } else {
      this.refreshClustersList();
      this.registerRefreshInterval();
    }
  };

  /**
   * Returns the string to use as the document.title
   */
  title() {
    if (this.props.selectedOrganization) {
      return `Cluster Overview | ${this.props.selectedOrganization}`;
    } else {
      return 'Cluster Overview';
    }
  }

  /**
   * Returns the proper last updated info string based on available
   * cluster and/or status information.
   */
  lastUpdatedLabel = () => {
    var maxTimestamp = 0;
    this.props.clusters.forEach(cluster => {
      maxTimestamp = Math.max(maxTimestamp, cluster.lastUpdated);
    });
    return moment(maxTimestamp).fromNow();
  };

  render() {
    return (
      <DocumentTitle title={this.title()}>
        {
          <LoadingOverlay loading={this.props.loadingClustersList !== false}>
            <div>
              {this.props.selectedOrganization && (
                <div className='well launch-new-cluster'>
                  <Link
                    to={`/organizations/${this.props.selectedOrganization}/clusters/new/`}
                  >
                    <Button bsStyle='primary' type='button'>
                      <i className='fa fa-add-circle' /> Launch New Cluster
                    </Button>
                  </Link>
                  {this.props.clusters.length === 0 &&
                    'Ready to launch your first cluster? Click the green button!'}
                </div>
              )}

              {this.props.clusters.length === 0 && (
                <ClusterEmptyState
                  errorLoadingClusters={this.props.errorLoadingClusters}
                  organizations={this.props.organizations}
                  selectedOrganization={this.props.selectedOrganization}
                />
              )}
<<<<<<< HEAD
            </TransitionGroup>

            {this.props.clusters.length > 0 ? (
              <p className='last-updated'>
                <small>
                  This table is auto-refreshing. Details last fetched{' '}
                  <span className='last-updated-datestring'>
                    {this.lastUpdatedLabel()}
                  </span>
                  .
                </small>
              </p>
            ) : null}
          </div>
=======

              <TransitionGroup className='cluster-list'>
                {_.sortBy(this.props.clusters, cluster => cluster.name).map(
                  cluster => {
                    return (
                      <CSSTransition
                        classNames='cluster-list-item'
                        key={cluster.id}
                        timeout={500}
                      >
                        <ClusterDashboardItem
                          animate={true}
                          cluster={cluster}
                          isNodePool={this.props.nodePoolsClusters.includes(
                            cluster.id
                          )}
                          key={cluster.id}
                          nodePools={this.props.nodePools}
                          selectedOrganization={this.props.selectedOrganization}
                        />
                      </CSSTransition>
                    );
                  },
                  cluster => cluster.id
                )}
              </TransitionGroup>

              {this.props.clusters.length > 0 ? (
                <p className='last-updated'>
                  <small>
                    This table is auto-refreshing. Details last fetched{' '}
                    <span className='last-updated-datestring'>
                      {this.lastUpdatedLabel()}
                    </span>
                    . <span className='beta-tag'>BETA</span>
                  </small>
                </p>
              ) : null}
            </div>
          </LoadingOverlay>
>>>>>>> 6659e4c... Batched cluster create
        }
      </DocumentTitle>
    );
  }
}

Home.propTypes = {
  clearInterval: PropTypes.func,
  clusters: PropTypes.array,
  actions: PropTypes.object,
  selectedOrganization: PropTypes.string,
  organizations: PropTypes.object,
  errorLoadingClusters: PropTypes.bool,
  nodePoolsClusters: PropTypes.array,
  nodePools: PropTypes.object,
};

function mapStateToProps(state) {
  var selectedOrganization = state.app.selectedOrganization;
  var organizations = state.entities.organizations.items;
  var allClusters = state.entities.clusters.items;
  var errorLoadingClusters = state.entities.clusters.errorLoading;
  const nodePoolsClusters = state.entities.clusters.nodePoolsClusters;
  const nodePools = state.entities.nodePools.items;
  const { loadingFlags } = state.entities;

  var clusters = [];
  if (selectedOrganization) {
    clusters = _.filter(allClusters, cluster => {
      return cluster.owner === selectedOrganization;
    });
  }

  return {
    clusters: clusters,
    organizations: organizations,
    errorLoadingClusters: errorLoadingClusters,
    selectedOrganization: selectedOrganization,
    nodePoolsClusters,
    nodePools,
    loadingClustersList: loadingFlags.CLUSTERS_LIST,
    loadingClustersDetails: loadingFlags.CLUSTERS_DETAILS,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    nodePoolActions: bindActionCreators(nodePoolActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReactTimeout(Home));
