import * as actionTypes from 'actions/actionTypes';
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
import {
  selectClustersList,
  selectErrorByAction,
} from 'selectors/clusterSelectors';
import { OrganizationsRoutes } from 'shared/constants/routes';
import Button from 'UI/Button';
import ClusterEmptyState from 'UI/ClusterEmptyState';
import _ from 'underscore';

import ClusterDashboardItem from './ClusterDashboardItem';

class Home extends React.Component {
  state = {
    lastUpdated: '',
  };

  visibilityTracker = new PageVisibilityTracker();

  componentDidMount() {
    this.registerRefreshInterval();
    this.visibilityTracker.addEventListener(this.handleVisibilityChange);
    this.setState({ lastUpdated: moment().fromNow() });
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
    this.setState({ lastUpdated: moment().fromNow() });
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

  render() {
    const { clusters, selectedOrganization } = this.props;

    const newClusterPath = RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.New,
      {
        orgId: selectedOrganization,
      }
    );

    return (
      <DocumentTitle title={this.title()}>
        <div data-testid='clusters-list'>
          {selectedOrganization && (
            <div className='well launch-new-cluster'>
              <Link to={newClusterPath}>
                <Button bsStyle='primary' type='button'>
                  <i className='fa fa-add-circle' /> Launch New Cluster
                </Button>
              </Link>
              {clusters.length === 0 &&
                'Ready to launch your first cluster? Click the green button!'}
            </div>
          )}

          {clusters.length === 0 && (
            <ClusterEmptyState
              errorLoadingClusters={this.props.errorLoadingClusters}
              organizations={this.props.organizations}
              selectedOrganization={selectedOrganization}
            />
          )}

          <TransitionGroup className='cluster-list'>
            {clusters
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map(({ id }) => (
                <CSSTransition
                  classNames='cluster-list-item'
                  key={id}
                  timeout={500}
                >
                  <ClusterDashboardItem
                    animate={true}
                    clusterId={id}
                    isV5Cluster={this.props.v5Clusters.includes(id)}
                    key={id}
                    nodePools={this.props.nodePools}
                    selectedOrganization={selectedOrganization}
                  />
                </CSSTransition>
              ))}
          </TransitionGroup>

          {clusters.length > 0 ? (
            <p className='last-updated'>
              <small>
                This table is auto-refreshing. Details last fetched{' '}
                <span className='last-updated-datestring'>
                  {this.state.lastUpdated}
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

const makeMapStateToProps = () => {
  const selectClusters = selectClustersList();

  function mapStateToProps(state) {
    const selectedOrganization = state.main.selectedOrganization;
    const organizations = state.entities.organizations.items;
    const errorLoadingClusters = selectErrorByAction(
      state,
      actionTypes.CLUSTERS_LIST_REQUEST
    );
    const v5Clusters = state.entities.clusters.v5Clusters;
    const nodePools = state.entities.nodePools.items;

    return {
      clusters: selectClusters(state),
      organizations,
      errorLoadingClusters: Boolean(errorLoadingClusters),
      selectedOrganization,
      v5Clusters,
      nodePools,
    };
  }

  return mapStateToProps;
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    nodePoolActions: bindActionCreators(nodePoolActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(ReactTimeout(Home));
