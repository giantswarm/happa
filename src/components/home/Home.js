import * as clusterActions from 'actions/clusterActions';
import * as nodePoolActions from 'actions/nodePoolActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Link } from 'react-router-dom';
import _ from 'underscore';
import Button from 'UI/button';
import ClusterDashboardItem from './ClusterDashboardItem';
import ClusterEmptyState from 'UI/cluster_empty_state';
import DocumentTitle from 'react-document-title';
import moment from 'moment';
import PageVisibilityTracker from 'lib/page_visibility_tracker';
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
    this.props.actions.clustersLoad();
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
      return (
        'Cluster Overview | ' +
        this.props.selectedOrganization +
        ' | Giant Swarm'
      );
    } else {
      return 'Cluster Overview | Giant Swarm';
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
          <div>
            {this.props.selectedOrganization ? (
              <div className='well launch-new-cluster'>
                <Link
                  to={`/organizations/${this.props.selectedOrganization}/clusters/new/`}
                >
                  <Button bsStyle='primary' type='button'>
                    <i className='fa fa-add-circle' /> Launch New Cluster
                  </Button>
                </Link>
                {this.props.clusters.length === 0
                  ? 'Ready to launch your first cluster? Click the green button!'
                  : ''}
              </div>
            ) : (
              undefined
            )}

            {this.props.clusters.length === 0 ? (
              <ClusterEmptyState
                errorLoadingClusters={this.props.errorLoadingClusters}
                organizations={this.props.organizations}
                selectedOrganization={this.props.selectedOrganization}
              />
            ) : null}

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
