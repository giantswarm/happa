'use strict';

import React from 'react';
import {Link, IndexLink}  from 'react-router';
import FlashMessages from './flash_messages/index';
import Modal from './modal/index';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import _ from 'underscore';
import { bindActionCreators } from 'redux';
import { organizationSelect, organizationsLoad } from '../actions/organizationActions';
import * as UserActions from '../actions/userActions';
import Breadcrumbs from 'react-breadcrumbs';
import Gravatar from 'react-gravatar';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';

class Layout extends React.Component {
  componentDidMount() {
    this.props.actions.refreshUserInfo().then(() => {
      this.props.dispatch(organizationsLoad());
      return null;
    })
    .catch(() => {
      this.props.actions.loginError();
    });
  }

  selectOrganization = (orgId) => {
    this.props.dispatch(organizationSelect(orgId));
  }

  render() {
    if (! this.props.firstLoadComplete) {
      return (
        <DocumentTitle title='Loading | Giant Swarm '>
          <div className='app-loading'>
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
            <nav>
              <div className='main-nav col-9'>
                <a href='https://giantswarm.io' target='_blank' rel='noopener noreferrer'><img className='logo' src='/images/giantswarm_icon.svg' /></a>



                <div className='nav-responsive'>
                  <IndexLink to='/' activeClassName='active'>Clusters</IndexLink>
                  <Link to='getting-started' activeClassName='active'>Getting Started</Link>
                  <a href='https://docs.giantswarm.io' target='_blank' rel='noopener noreferrer'>Documentation <i className='fa fa-external-link'></i></a>
                </div>

                <div className='subactions'>
                  <div className='organization_dropdown'>
                    {
                      (_.map(this.props.organizations.items, (x) => {return x.id;}).length === 0 && ! this.props.organizations.isFetching) ?
                      <DropdownButton title={<span><span className='label label-default'>ORG</span>No organizations</span>} key='2' id='org_dropdown'>
                        <MenuItem componentClass={Link} href='/organizations' to='/organizations'>Manage organizations</MenuItem>
                      </DropdownButton>
                      :
                      <DropdownButton title={<span><span className='label label-default'>ORG</span> {this.props.selectedOrganization}</span>} key='2' id='org_dropdown'>
                        <MenuItem componentClass={Link} href='/organizations/giantswarm' to={'/organizations/' + this.props.selectedOrganization}>Details for {this.props.selectedOrganization}</MenuItem>
                        <MenuItem divider />
                        <MenuItem componentClass={Link} href='/organizations' to='/organizations'>Manage organizations</MenuItem>
                        <MenuItem divider />
                        <MenuItem header>Switch Organization</MenuItem>
                        {

                          _.map(_.sortBy(this.props.organizations.items, 'id'), (org) => {
                            return <MenuItem onSelect={this.selectOrganization} eventKey={org.id} key={org.id}>{org.id}</MenuItem>;
                          })
                        }
                      </DropdownButton>
                    }
                  </div>
                  &nbsp;
                  &nbsp;
                  <div className="user_dropdown">

                    <DropdownButton ref={(d) => {this.user_dropdown = d;}} pullRight={true} title={
                      <div className="user_dropdown--toggle">
                        <Gravatar email={this.props.user.email} size={100} default='mm' />
                        <span>{this.props.user.email}</span>
                      </div>} key='1' id='user_dropdown'>
                      {
                        this.props.user.auth.scheme === 'giantswarm' ?
                        <MenuItem componentClass={Link} href='/account_settings' to='/account_settings'>Account Settings</MenuItem>
                        :
                        undefined
                      }
                      <MenuItem componentClass={Link} href='/logout' to='/logout'>Logout</MenuItem>
                    </DropdownButton>
                  </div>
                </div>
              </div>

              <div className="breadcrumb-wrapper">
                <div className="main col-9">
                  <Breadcrumbs routes={this.props.routes} params={this.props.params} setDocumentTitle={true}/>
                </div>
              </div>
            </nav>

            <div className='main col-9'>
              <Modal />
              {this.props.children}
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
  actions: PropTypes.object
};

function mapStateToProps(state) {
  return {
    organizations: state.entities.organizations,
    user: state.app.loggedInUser,
    selectedOrganization: state.app.selectedOrganization,
    firstLoadComplete: state.app.firstLoadComplete
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(UserActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(Layout);
