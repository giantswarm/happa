'use strict';

import React from 'react';
import { connect } from 'react-redux';
import ClusterDashboardItem from './cluster_dashboard_item';
import ClusterEmptyState from './cluster_empty_state';
import * as clusterActions from '../../actions/clusterActions';
import { bindActionCreators } from 'redux';
import Button from '../shared/button';
import { Link } from 'react-router-dom';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import Noty from 'noty';

class Home extends React.Component {
  state = {
    notyTheme: 'bootstrap-v3',
    notyLayout: 'topRight',
    notyType: 'success',
  };

  componentDidMount() {
    this.fetchClusterDetails(this.props.clusters);
  }

  componentDidUpdate(prevProps) {
    if (
      !_.isEqual(
        this.props.clusters.map(x => x.id),
        prevProps.clusters.map(x => x.id)
      )
    ) {
      this.fetchClusterDetails(this.props.clusters);
    }
  }

  clustersSortedById(clusters) {
    return _.sortBy(clusters, 'id');
  }

  clusterIds(clusters) {
    return this.clustersSortedById(clusters).map(cluster => cluster.id);
  }

  fetchClusterDetails(clusters) {
    return Promise.all(
      _.flatten(
        clusters.map(cluster => {
          return [this.props.actions.clusterLoadDetails(cluster.id)];
        })
      )
    );
  }

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

  showNotification() {
    new Noty({
      type: this.state.notyType,
      text:
        'This is a <code>' +
        this.state.notyType +
        '</code> message that will vanish after it´s timeout period is reached.',
      timeout: 10000,
      theme: this.state.notyTheme,
      layout: this.state.notyLayout,
      visibilityControl: true,
    }).show();
  }

  setNotyTheme(event) {
    this.setState({ notyTheme: event.target.value });
  }

  setNotyLayout(event) {
    this.setState({ notyLayout: event.target.value });
  }

  setNotyType(event) {
    this.setState({ notyType: event.target.value });
  }

  render() {
    return (
      <DocumentTitle title={this.title()}>
        {
          <div>
            <div className='well'>
              <form className='form-inline'>
                <div className='form-group'>
                  <label htmlFor='notyTheme'>Theme</label>
                  <select
                    className='form-control'
                    id='notyTheme'
                    onChange={this.setNotyTheme.bind(this)}
                    defaultValue={this.state.notyTheme}
                  >
                    <option>bootstrap-v3</option>
                    <option>bootstrap-v4</option>
                    <option>light</option>
                    <option>metroui</option>
                    <option>mint</option>
                    <option>relax</option>
                    <option>semanticui</option>
                    <option>sunset</option>
                  </select>
                </div>

                <div className='form-group'>
                  <label htmlFor='notyTheme'>Layout</label>
                  <select
                    className='form-control'
                    id='notyLayout'
                    onChange={this.setNotyLayout.bind(this)}
                    defaultValue={this.state.notyLayout}
                  >
                    <option>top</option>
                    <option>topLeft</option>
                    <option>topCenter</option>
                    <option>topRight</option>
                    <option>center</option>
                    <option>centerLeft</option>
                    <option>centerRight</option>
                    <option>bottom</option>
                    <option>bottomLeft</option>
                    <option>bottomCenter</option>
                    <option>bottomRight</option>
                  </select>
                </div>

                <div className='form-group'>
                  <label htmlFor='notyType'>Type</label>
                  <select
                    className='form-control'
                    id='notyType'
                    onChange={this.setNotyType.bind(this)}
                    defaultValue={this.state.notyType}
                  >
                    <option>alert</option>
                    <option>success</option>
                    <option>error</option>
                    <option>warning</option>
                    <option>info</option>
                  </select>
                </div>
              </form>

              <br />

              <Button type='button' onClick={e => this.showNotification(e)}>
                Create Notification
              </Button>
            </div>
            {this.props.selectedOrganization ? (
              <div className='well launch-new-cluster'>
                <Link to='new-cluster'>
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

            {_.sortBy(this.props.clusters, cluster => cluster.name).map(
              cluster => {
                return (
                  <ClusterDashboardItem
                    selectedOrganization={this.props.selectedOrganization}
                    animate={true}
                    key={cluster.id}
                    cluster={cluster}
                  />
                );
              },
              cluster => cluster.id
            )}
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
