import DocumentTitle from 'components/shared/DocumentTitle';
import formatDistance from 'date-fns/fp/formatDistance';
import { Box } from 'grommet';
import PageVisibilityTracker from 'lib/pageVisibilityTracker';
import RoutePath from 'lib/routePath';
import { batchedRefreshClusters } from 'model/stores/batchActions';
import { CLUSTERS_LIST_REQUEST } from 'model/stores/cluster/constants';
import { selectClustersList } from 'model/stores/cluster/selectors';
import { selectErrorByAction } from 'model/stores/error/selectors';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactTimeout from 'react-timeout';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { OrganizationsRoutes } from 'shared/constants/routes';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import ClusterEmptyState from 'UI/Display/Cluster/ClusterEmptyState';
import { memoize } from 'underscore';

import ClusterDashboardItem from './ClusterDashboardItem';

const newClusterPathMemoized = memoize(
  (orgId) =>
    RoutePath.createUsablePath(OrganizationsRoutes.Clusters.New, {
      orgId,
    }),
  (orgId) => orgId
);

const AnimationWrapper = styled.div`
  .cluster-list-item-enter,
  .cluster-list-item-appear {
    opacity: 0;
  }

  .cluster-list-item-appear.cluster-list-item-appear-active {
    opacity: 1;
    transition: opacity 150ms ease-in;
  }

  .cluster-list-item-enter.cluster-list-item-enter-active {
    opacity: 1;
    transition: opacity 150ms ease-in;
  }

  .cluster-list-item-exit {
    opacity: 1;
  }

  .cluster-list-item-exit.cluster-list-item-exit-active {
    opacity: 0;
    transition: opacity 150ms ease-in;
  }
`;

class Home extends React.Component {
  state = {
    lastUpdated: '',
  };

  visibilityTracker = new PageVisibilityTracker();

  componentDidMount() {
    this.registerRefreshInterval();
    this.visibilityTracker.addEventListener(this.handleVisibilityChange);
    this.setState({
      lastUpdated: `${formatDistance(new Date())(new Date())} ago`,
    });
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
    this.refreshInterval = this.props.setInterval(
      this.refreshClustersList,
      refreshIntervalDuration
    );
  };

  refreshClustersList = () => {
    this.props.dispatch(batchedRefreshClusters());
    this.setState({
      lastUpdated: `${formatDistance(new Date())(new Date())} ago`,
    });
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

  newClusterPath() {
    return newClusterPathMemoized(this.props.selectedOrganization);
  }

  render() {
    const { clusters, selectedOrganization } = this.props;

    return (
      <DocumentTitle title={this.title()}>
        <div data-testid='clusters-list'>
          {selectedOrganization && (
            <Box className='well' gap='small' direction='row' align='center'>
              <Link to={this.newClusterPath()}>
                <Button
                  primary={true}
                  type='button'
                  icon={<i className='fa fa-add-circle' />}
                >
                  Launch new cluster
                </Button>
              </Link>
              {clusters.length === 0 &&
                'Ready to launch your first cluster? Click the green button!'}
            </Box>
          )}
          {clusters.length === 0 && (
            <ClusterEmptyState
              errorLoadingClusters={this.props.errorLoadingClusters}
              selectedOrganization={selectedOrganization}
            />
          )}
          {clusters.length > 0 && (
            <AnimationWrapper>
              <TransitionGroup
                className='cluster-list'
                appear={true}
                enter={true}
              >
                {clusters.map((id) => (
                  <CSSTransition
                    classNames='cluster-list-item'
                    key={id}
                    timeout={200}
                    exit={false}
                  >
                    <ClusterDashboardItem
                      clusterId={id}
                      isV5Cluster={this.props.v5Clusters.includes(id)}
                      key={id}
                      selectedOrganization={selectedOrganization}
                    />
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </AnimationWrapper>
          )}
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

const makeMapStateToProps = () => {
  const selectClusters = selectClustersList();

  function mapStateToProps(state) {
    const selectedOrganization = state.main.selectedOrganization;
    const errorLoadingClusters = selectErrorByAction(
      state,
      CLUSTERS_LIST_REQUEST
    );
    const v5Clusters = state.entities.clusters.v5Clusters;

    return {
      clusters: selectClusters(state),
      errorLoadingClusters: Boolean(errorLoadingClusters),
      selectedOrganization,
      v5Clusters,
    };
  }

  return mapStateToProps;
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(
  makeMapStateToProps,
  mapDispatchToProps
)(ReactTimeout(Home));
