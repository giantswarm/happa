'use strict';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {connect} from 'react-redux';
import ClusterDashboard from './cluster_dashboard';
import ClusterEmptyState from './cluster_empty_state';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import { flashAdd } from '../../actions/flashMessageActions';
import _ from 'underscore';

var Home = React.createClass({
  componentDidMount: function() {
    Promise.all(
      this.props.clusters.map((cluster) => {
        console.log(cluster.id);
        return this.props.actions.clusterLoadDetails(cluster.id);
      })
    )
    .catch((error) => {
      this.props.dispatch(flashAdd({
        message: <span>Something went wrong while trying to load cluster details. Please try again later or contact support: support@giantswarm.io</span>,
        class: 'danger',
        ttl: 3000
      }));

      this.setState({
        loading: 'failed'
      });
    });
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
  return {
    actions: bindActionCreators(clusterActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Home);