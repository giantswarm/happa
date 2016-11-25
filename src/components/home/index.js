'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReactTimeout from 'react-timeout';
import {connect} from 'react-redux';
import ClusterDashboard from './cluster_dashboard';
import ClusterEmptyState from './cluster_empty_state';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { flashAdd } from '../../actions/flashMessageActions';
import _ from 'underscore';

const DESMOTES_POLL_INTERVAL = 5000; // 60 Seconds

var Home = React.createClass({
  componentDidMount: function() {
    this.updateMetrics(this.props.clusters);

    this.props.setInterval(() => {
      this.updateMetrics(this.props.clusters);
    }, DESMOTES_POLL_INTERVAL);
  },

  clustersSortedById: function(clusters) {
    return _.sortBy(clusters, 'id');
  },

  clusterIds: function(clusters) {
    return this.clustersSortedById(clusters).map((cluster) => cluster.id);
  },

  componentWillReceiveProps: function(nextProps) {
    var clustersAreTheSame = _.isEqual(this.clusterIds(nextProps.clusters), this.clusterIds(this.props.clusters));

    if (! clustersAreTheSame) {
      this.updateMetrics(nextProps.clusters);
    }
  },

  updateMetrics: function(clusters) {
    return Promise.all(
      _.flatten(clusters.map((cluster) => {
        return [
          this.props.actions.clusterLoadDetails(cluster.id),
          this.props.actions.clusterFetchMetrics(cluster.id)
        ];
      }))
    );
  },

  render: function() {
    return (
      <div>
        {/*
        <div className='well launch-new-cluster'>
          <Button type='button' bsSize='large' bsStyle='primary'>Launch New Cluster</Button>
          Believe it or not, you can have as many clusters as you like.
        </div>
        */}

        {
          this.props.clusters.length === 0 ? <ClusterEmptyState selectedOrganization={this.props.selectedOrganization} organizations={this.props.organizations} /> : null
        }

        {
          _.map(_.sortBy(this.props.clusters, (cluster) => cluster.id), (cluster) => {
            if (cluster.errorLoadingMetrics) {
              return <ClusterDashboard cluster={cluster} key={cluster.id + 'error'} className='empty-slate'>
                <h1>Couldn't load metrics for cluster <code>{cluster.id}</code></h1>
                <p>We're currently improving our metrics gathering.</p>
                <p>If you need metrics, you can <a href='https://docs.giantswarm.io/guides/kubernetes-prometheus/' target="_blank">set up your own monitoring with Prometheus easily</a></p>
                <p>Thanks for your patience! If you have any questions don't hesitate to contact support: <a href='mailto:support@giantswarm.io'>support@giantswarm.io</a></p>
              </ClusterDashboard>;
            } else if (cluster.metricsLoading && ! cluster.metricsLoadedFirstTime) {
              return <ClusterDashboard cluster={cluster} key={cluster.id} className='loading' />;
            } else {
              return <ClusterDashboard animate={true} key={cluster.id} cluster={cluster} />;
            }
          }, (cluster) => cluster.id)
        }
      </div>
    );
  }
});


function mapStateToProps(state, ownProps) {
  var selectedOrganization = state.app.selectedOrganization;
  var organizations = state.entities.organizations.items;
  var clusterIds = organizations[selectedOrganization].clusters;
  var clusters = clusterIds.map((clusterId) => {
    return state.entities.clusters.items[clusterId];
  });

  return {
    clusters: clusters,
    organizations: organizations,
    selectedOrganization: selectedOrganization
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(ReactTimeout(Home));