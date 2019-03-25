'use strict';

import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Link } from 'react-router-dom';
import _ from 'underscore';
import Button from '../shared/button';
import ClusterDashboardItem from './cluster_dashboard_item';
import ClusterEmptyState from './cluster_empty_state';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

class Home extends React.Component {
  componentDidMount() {
    this.registerRefreshInterval();
    this.fetchClusterDetails(this.props.clusters);
  }

  componentDidUpdate(prevProps) {
    console.debug('componentDidUpdate: prevProps.clusters', prevProps.clusters);
    console.debug(
      'componentDidUpdate: this.props.clusters',
      this.props.clusters
    );

    // load cluster details if cluster list has changed
    if (
      !_.isEqual(
        this.props.clusters.map(x => x.id),
        prevProps.clusters.map(x => x.id)
      )
    ) {
      this.fetchClusterDetails(this.props.clusters);
    }
  }

  componentWillUnmount() {
    window.clearInterval(this.refreshInterval);
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

  clustersSortedById = clusters => {
    return _.sortBy(clusters, 'id');
  };

  fetchClusterDetails = clusters => {
    return Promise.all(
      _.flatten(
        clusters.map(cluster => {
          return [this.props.actions.clusterLoadDetails(cluster.id)];
        })
      )
    );
  };

  /**
   * Returns the string to use as the document.title
   */
  title = () => {
    if (this.props.selectedOrganization) {
      return (
        'Cluster Overview | ' +
        this.props.selectedOrganization +
        ' | Giant Swarm'
      );
    } else {
      return 'Cluster Overview | Giant Swarm';
    }
  };

  render() {
    console.debug('Home render()');
    return (
      <DocumentTitle title={this.title()}>
        {
          <div>
            {this.props.selectedOrganization ? (
              <div className='well launch-new-cluster'>
                <Link
                  to={`/organizations/${
                    this.props.selectedOrganization
                  }/clusters/new/`}
                >
                  <Button type='button' bsStyle='primary'>
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
                selectedOrganization={this.props.selectedOrganization}
                organizations={this.props.organizations}
              />
            ) : null}

            <TransitionGroup className='cluster-list'>
              {_.sortBy(this.props.clusters, cluster => cluster.name).map(
                cluster => {
                  return (
                    <CSSTransition
                      key={cluster.id}
                      timeout={500}
                      classNames='cluster-list-item'
                    >
                      <ClusterDashboardItem
                        selectedOrganization={this.props.selectedOrganization}
                        animate={true}
                        key={cluster.id}
                        cluster={cluster}
                      />
                    </CSSTransition>
                  );
                },
                cluster => cluster.id
              )}
            </TransitionGroup>
          </div>
        }
      </DocumentTitle>
    );
  }
}

Home.propTypes = {
  clusters: PropTypes.array,
  actions: PropTypes.object,
  selectedOrganization: PropTypes.string,
  organizations: PropTypes.object,
  errorLoadingClusters: PropTypes.bool,
};

function mapStateToProps(state) {
  var selectedOrganization = state.app.selectedOrganization;
  var organizations = state.entities.organizations.items;
  var allClusters = state.entities.clusters.items;
  var errorLoadingClusters = state.entities.clusters.errorLoading;

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
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
