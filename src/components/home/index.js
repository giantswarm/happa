'use strict';

import React from 'react';
import {connect} from 'react-redux';
import ClusterDashboardItem from './cluster_dashboard_item';
import ClusterEmptyState from './cluster_empty_state';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import Button from '../button';
import {Link}  from 'react-router-dom';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';

class Home extends React.Component {

  componentDidMount() {
    this.fetchClusterDetails(this.props.clusters);
  }

  componentDidUpdate(prevProps) {
    if (! _.isEqual(_.map(this.props.clusters, x => x.id), _.map(prevProps.clusters, x => x.id))) {
      this.fetchClusterDetails(this.props.clusters);
    }
  }

  clustersSortedById(clusters) {
    return _.sortBy(clusters, 'id');
  }

  clusterIds(clusters) {
    return this.clustersSortedById(clusters).map((cluster) => cluster.id);
  }

  fetchClusterDetails(clusters) {
    return Promise.all(
      _.flatten(clusters.map((cluster) => {
        return [this.props.actions.clusterLoadDetails(cluster.id)];
      }))
    );
  }

  title() {
    if (this.props.selectedOrganization) {
      return 'Cluster Overview | ' + this.props.selectedOrganization + ' | Giant Swarm';
    } else {
      return 'Cluster Overview | Giant Swarm';
    }
  }

  render() {
    return (
      <DocumentTitle title={this.title()}>
      {
        <div>
          {
            this.props.selectedOrganization ?
              <div className='well launch-new-cluster'>

                <Link to='new-cluster'>
                  <Button type='button' bsStyle='primary'>Launch New Cluster</Button>
                </Link>
                {
                  this.props.clusters.length === 0 ?
                  'Ready to launch your first cluster? Click the green button!'
                  :
                  ''
                }
              </div>
            :
            undefined
          }

          {
            this.props.clusters.length === 0 ? <ClusterEmptyState errorLoadingClusters={this.props.errorLoadingClusters} selectedOrganization={this.props.selectedOrganization} organizations={this.props.organizations} /> : null
          }

          {
            _.map(_.sortBy(this.props.clusters, (cluster) => cluster.name), (cluster) => {
              return <ClusterDashboardItem selectedOrganization={this.props.selectedOrganization} animate={true} key={cluster.id} cluster={cluster} />;
            }, (cluster) => cluster.id)
          }
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
  errorLoadingClusters: PropTypes.bool
};

function mapStateToProps(state) {
  var selectedOrganization = state.app.selectedOrganization;
  var organizations = state.entities.organizations.items;
  var allClusters = state.entities.clusters.items;
  var errorLoadingClusters = state.entities.clusters.errorLoading;

  var clusters = [];
  if (selectedOrganization) {
    clusters = _.filter(allClusters, (cluster) => {
      return cluster.owner === selectedOrganization;
    });
  }

  return {
    clusters: clusters,
    organizations: organizations,
    errorLoadingClusters: errorLoadingClusters,
    selectedOrganization: selectedOrganization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
