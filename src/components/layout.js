'use strict';

import * as FlashActions from '../actions/flashMessageActions';
import * as UserActions from '../actions/userActions';
import AccountSettings from './account_settings/index';
import { bindActionCreators } from 'redux';
import { Breadcrumb } from 'react-breadcrumbs';
import ClusterDetails from './cluster_detail/index';
import { clustersLoad } from '../actions/clusterActions';
import { connect } from 'react-redux';
import CreateCluster from './create_cluster/index';
import DocumentTitle from 'react-document-title';
import FlashMessages from './flash_messages/index';
import GettingStarted from './getting-started/index';
import GiantSwarmV4 from 'giantswarm-v4';
import Home from './home/index';
import Modals from './modals/index';
import Navigation from './navigation/index';
import { organizationsLoad } from '../actions/organizationActions';
import OrganizationDetails from './organizations/detail';
import Organizations from './organizations/index';
import PropTypes from 'prop-types';
import { push } from 'connected-react-router';
import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Users from './users/index';

var defaultClient = GiantSwarmV4.ApiClient.instance;
defaultClient.basePath = window.config.apiEndpoint;
defaultClient.timeout = 10000;
var defaultClientAuth =
  defaultClient.authentications['AuthorizationHeaderToken'];

class Layout extends React.Component {
  componentDidMount() {
    if (this.props.user) {
      defaultClientAuth.apiKeyPrefix = this.props.user.auth.scheme;
      defaultClientAuth.apiKey = this.props.user.auth.token;

      // This is the first component that loads,
      // and refreshUserInfo and the subsequent organisationsLoad() are the
      // first calls happa makes to the API.
      this.props.actions
        .refreshUserInfo()
        .then(() => {
          return Promise.all([
            this.props.dispatch(organizationsLoad()),
            this.props.dispatch(clustersLoad()),
          ]);
        })
        .then(() => {
          this.props.dispatch(clustersLoad());
        })
        .catch(error => {
          if (error.status === 401) {
            this.props.flashActions.flashAdd({
              message:
                'Please log in again, your previously saved credentials appear to be invalid.',
              class: 'warning',
            });

            this.props.dispatch(push('/login'));
          } else {
            this.props.flashActions.flashAdd({
              message: (
                <div>
                  <strong>
                    Something went wrong while trying to load user and
                    organization information.
                  </strong>
                  <br />
                  Please try again later or contact support:
                  support@giantswarm.io
                </div>
              ),
              class: 'warning',
            });
          }

          console.error(error);
        });
    } else {
      this.props.dispatch(push('/login'));
    }
  }

  render() {
    if (!this.props.firstLoadComplete) {
      return (
        <DocumentTitle title='Loading | Giant Swarm '>
          <div className='app-loading'>
            <FlashMessages />
            <div className='app-loading-contents'>
              <img className='loader' src='/images/loader_oval_light.svg' />
            </div>
          </div>
        </DocumentTitle>
      );
    } else {
      return (
        <DocumentTitle title='Giant Swarm'>
          <React.Fragment>
            <FlashMessages />
            <Navigation
              user={this.props.user}
              organizations={this.props.organizations}
              selectedOrganization={this.props.selectedOrganization}
            />
            <Modals />
            <Breadcrumb data={{ title: 'HOME', pathname: '/' }}>
              <div className='main col-9'>
                <Switch>
                  <Route exact path='/' component={Home} />
                  <Route
                    exact
                    path='/getting-started/'
                    component={GettingStarted}
                  />
                  <Route
                    exact
                    path='/getting-started/*'
                    component={GettingStarted}
                  />
                  <Route exact path='/users/' component={Users} />
                  <Route exact path='/new-cluster/' component={CreateCluster} />
                  <Route
                    exact
                    path='/organizations/'
                    component={Organizations}
                  />
                  <Route
                    exact
                    path='/organizations/:orgId/'
                    component={OrganizationDetails}
                  />
                  <Route
                    exact
                    path='/organizations/:orgId/clusters/:clusterId/'
                    component={ClusterDetails}
                  />
                  <Route
                    exact
                    path='/account-settings/'
                    component={AccountSettings}
                  />
                  <Redirect path='*' to='/' />
                </Switch>
              </div>
            </Breadcrumb>
          </React.Fragment>
        </DocumentTitle>
      );
    }
  }
}

Layout.propTypes = {
  children: PropTypes.object,
  routes: PropTypes.array,
  params: PropTypes.object,
  user: PropTypes.object,
  organizations: PropTypes.object,
  selectedOrganization: PropTypes.string,
  firstLoadComplete: PropTypes.bool,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
  flashActions: PropTypes.object,
  path: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    organizations: state.entities.organizations,
    user: state.app.loggedInUser,
    selectedOrganization: state.app.selectedOrganization,
    firstLoadComplete: state.app.firstLoadComplete,
    path: state.router.location.pathname,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(UserActions, dispatch),
    flashActions: bindActionCreators(FlashActions, dispatch),
    dispatch: dispatch,
  };
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(Layout);
