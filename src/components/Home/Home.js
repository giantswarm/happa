import { batchedRefreshClusters } from 'actions/batchedActions';
import * as clusterActions from 'actions/clusterActions';
import * as nodePoolActions from 'actions/nodePoolActions';
import DocumentTitle from 'components/shared/DocumentTitle';
import PageVisibilityTracker from 'lib/pageVisibilityTracker';
import RoutePath from 'lib/routePath';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTimeout from 'react-timeout';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { bindActionCreators } from 'redux';
import { OrganizationsRoutes } from 'shared/constants/routes';
import Button from 'UI/Button';
import ClusterEmptyState from 'UI/ClusterEmptyState';
import _ from 'underscore';

import ClusterDashboardItem from './ClusterDashboardItem';

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
    // eslint-disable-next-line no-magic-numbers
    const refreshIntervalDuration = 30 * 1000; // 30 seconds
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
    }

    return 'Cluster Overview';
  }

  /**
   * Returns the proper last updated info string based on available
   * cluster and/or status information.
   */
  lastUpdatedLabel = () => {
    let maxTimestamp = 0;
    this.props.clusters.forEach(cluster => {
      maxTimestamp = Math.max(maxTimestamp, cluster.lastUpdated);
    });

    return moment(maxTimestamp).fromNow();
  };

  render() {
    const newClusterPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.New,
      {
        orgId: this.props.selectedOrganization,
      }
    );

    return (
      <DocumentTitle title={this.title()}>
        <div>
          {this.props.selectedOrganization && (
            <div className='well launch-new-cluster'>
              <Link to={newClusterPath}>
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
                      isNodePool={this.props.v5Clusters.includes(cluster.id)}
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
                .
              </small>
            </p>
          ) : null}
        </div>
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
  v5Clusters: PropTypes.array,
  nodePools: PropTypes.object,
  dispatch: PropTypes.func,
};

function mapStateToProps(state) {
  const selectedOrganization = state.app.selectedOrganization;
  const organizations = state.entities.organizations.items;
  const allClusters = state.entities.clusters.items;
  const errorLoadingClusters = state.entities.clusters.errorLoading;
  const v5Clusters = state.entities.clusters.v5Clusters;
  const nodePools = state.entities.nodePools.items;

  let clusters = [];
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
    v5Clusters,
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

export default connect(mapStateToProps, mapDispatchToProps)(ReactTimeout(Home));
