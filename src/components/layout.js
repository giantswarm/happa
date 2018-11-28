'use strict';

import React from 'react';
import { Redirect, NavLink, Route, Switch } from 'react-router-dom';
import FlashMessages from './flash_messages/index';
import Modal from './modal/index';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { connect } from 'react-redux';
import _ from 'underscore';
import { bindActionCreators } from 'redux';
import {
  organizationSelect,
  organizationsLoad,
} from '../actions/organizationActions';
import * as UserActions from '../actions/userActions';
import * as FlashActions from '../actions/flashMessageActions';
import Gravatar from 'react-gravatar';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import GettingStarted from './getting-started/index';
import Users from './users/index';
import Organizations from './organizations/index';
import OrganizationDetails from './organizations/detail';
import ClusterDetails from './organizations/cluster_detail';
import AccountSettings from './account_settings/index';
import CreateCluster from './create_cluster/index';
import Home from './home/index';
import GiantSwarmV4 from 'giantswarm-v4';
import { push } from 'connected-react-router';
import { Breadcrumbs, Breadcrumb } from 'react-breadcrumbs';

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
          this.props.dispatch(organizationsLoad());
          return null;
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

          throw error;
        });
    } else {
      this.props.dispatch(push('/login'));
    }
  }

  selectOrganization = orgId => {
    this.props.dispatch(organizationSelect(orgId));
  };

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
          <div>
            <FlashMessages />
            <nav className='outer-nav'>
              <div className='main-nav col-9'>
                <a
                  href='https://giantswarm.io'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  <img className='logo' src='/images/giantswarm_icon.svg' />
                </a>
                <div className='nav-responsive'>
                  <NavLink to='/' activeClassName='active'>
                    Clusters
                  </NavLink>
                  <NavLink to='/getting-started/' activeClassName='active'>
                    Getting Started
                  </NavLink>
                  <a
                    href='https://docs.giantswarm.io'
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    Documentation <i className='fa fa-external-link' />
                  </a>

                  {this.props.user.isAdmin ? (
                    <NavLink to='/users/' activeClassName='active'>
                      Users
                    </NavLink>
                  ) : (
                    undefined
                  )}
                </div>

                <div className='subactions'>
                  <div className='organization_dropdown'>
                    {_.map(this.props.organizations.items, x => {
                      return x.id;
                    }).length === 0 && !this.props.organizations.isFetching ? (
                      <DropdownButton
                        title={
                          <span>
                            <span className='label label-default'>ORG</span>No
                            organizations
                          </span>
                        }
                        key='2'
                        id='org_dropdown'
                      >
                        <MenuItem
                          componentClass={NavLink}
                          href='/organizations/'
                          to='/organizations/'
                        >
                          Manage organizations
                        </MenuItem>
                      </DropdownButton>
                    ) : (
                      <DropdownButton
                        title={
                          <span>
                            <span className='label label-default'>ORG</span>{' '}
                            {this.props.selectedOrganization}
                          </span>
                        }
                        key='2'
                        id='org_dropdown'
                      >
                        <MenuItem
                          componentClass={NavLink}
                          href='/organizations/'
                          to={
                            '/organizations/' + this.props.selectedOrganization
                          }
                        >
                          Details for {this.props.selectedOrganization}
                        </MenuItem>
                        <MenuItem divider />
                        <MenuItem
                          componentClass={NavLink}
                          href='/organizations/'
                          to='/organizations/'
                        >
                          Manage organizations
                        </MenuItem>
                        <MenuItem divider />
                        <MenuItem header>Switch Organization</MenuItem>
                        {_.map(
                          _.sortBy(this.props.organizations.items, 'id'),
                          org => {
                            return (
                              <MenuItem
                                onSelect={this.selectOrganization}
                                eventKey={org.id}
                                key={org.id}
                              >
                                {org.id}
                              </MenuItem>
                            );
                          }
                        )}
                      </DropdownButton>
                    )}
                  </div>
                  &nbsp; &nbsp;
                  <div className='user_dropdown'>
                    <DropdownButton
                      ref={d => {
                        this.user_dropdown = d;
                      }}
                      pullRight={true}
                      title={
                        <div className='user_dropdown--toggle'>
                          <Gravatar
                            email={this.props.user.email}
                            size={100}
                            default='mm'
                          />
                          <span>{this.props.user.email}</span>
                        </div>
                      }
                      key='1'
                      id='user_dropdown'
                    >
                      {this.props.user.auth.scheme === 'giantswarm' ? (
                        <MenuItem
                          componentClass={NavLink}
                          href='/account-settings/'
                          to='/account-settings/'
                        >
                          Account Settings
                        </MenuItem>
                      ) : (
                        undefined
                      )}
                      <MenuItem
                        componentClass={NavLink}
                        href='/logout'
                        to='/logout'
                      >
                        Logout
                      </MenuItem>
                    </DropdownButton>
                  </div>
                </div>
              </div>

              <div className='breadcrumb-wrapper'>
                <div className='main col-9'>
                  <Breadcrumbs />
                </div>
              </div>
            </nav>

            <div className='main col-9'>
              <Modal />
              <Breadcrumb data={{ title: 'HOME', pathname: '/' }}>
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
              </Breadcrumb>
            </div>
          </div>
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
