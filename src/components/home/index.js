'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {connect} from 'react-redux';
import ClusterDashboard from './cluster_dashboard';
import ClusterEmptyState from './cluster_empty_state';

var Home = React.createClass({
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
          this.props.clusters.map((cluster) => {
            return <ClusterDashboard animate={true} key={cluster.id} cluster={cluster} />;
          })
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
  return {};
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Home);