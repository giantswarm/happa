'use strict';

import React from 'react';
import ReactTimeout from 'react-timeout';
import {connect} from 'react-redux';
import ClusterDashboard from './cluster_dashboard';
import ClusterEmptyState from './cluster_empty_state';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import Button from '../button';
import {Link}  from 'react-router';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';
// import Button from '../button';
// import {Link}  from 'react-router';

const DESMOTES_POLL_INTERVAL = 60000; // 60 Seconds

class Home extends React.Component {
  componentDidMount() {
    this.updateMetrics(this.props.clusters);

    this.props.setInterval(() => {
      this.updateMetrics(this.props.clusters);
    }, DESMOTES_POLL_INTERVAL);
  }

  clustersSortedById(clusters) {
    return _.sortBy(clusters, 'id');
  }

  clusterIds(clusters) {
    return this.clustersSortedById(clusters).map((cluster) => cluster.id);
  }

  componentWillReceiveProps(nextProps) {
    var clustersAreTheSame = _.isEqual(this.clusterIds(nextProps.clusters), this.clusterIds(this.props.clusters));

    if (! clustersAreTheSame) {
      this.updateMetrics(nextProps.clusters);
    }
  }

  updateMetrics(clusters) {
    return Promise.all(
      _.flatten(clusters.map((cluster) => {
        return [
          this.props.actions.clusterLoadDetails(cluster.id),
          this.props.actions.clusterFetchMetrics(cluster.id)
        ];
      }))
    );
  }

  render() {
    return (
      <DocumentTitle title={'Cluster Overview | ' + this.props.selectedOrganization + ' | Giant Swarm'}>
        <div>
          <div className='well launch-new-cluster'>

            <Link to='new-cluster'>
              <Button type='button' bsStyle='primary'>Launch New Cluster</Button>
            </Link>
            {
              this.props.clusters.length === 0 ?
              'Ready to launch your first cluster? Click the green button!'
              :
              'Believe it or not, you can have as many clusters as you like.'
            }

          </div>

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
                return <ClusterDashboard selectedOrganization={this.props.selectedOrganization} cluster={cluster} key={cluster.id} className='loading' />;
              } else {
                return <ClusterDashboard selectedOrganization={this.props.selectedOrganization} animate={true} key={cluster.id} cluster={cluster} />;
              }
            }, (cluster) => cluster.id)
          }
        </div>
      </DocumentTitle>
    );
  }
}

Home.propTypes = {
  clusters: React.PropTypes.array,
  setInterval: React.PropTypes.func,
  actions: React.PropTypes.object,
  selectedOrganization: React.PropTypes.string,
  organizations: React.PropTypes.object
};

function mapStateToProps(state) {
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

export default connect(mapStateToProps, mapDispatchToProps)(ReactTimeout(Home));