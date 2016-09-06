'use strict';

import React from 'react';
import {Link, IndexLink}  from 'react-router';
import FlashMessages from './flash_messages/index';
import Modal from './modal/index';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { connect } from 'react-redux';
import _ from 'underscore';
import { organizationSelect, organizationsLoad } from '../actions/organizationActions';
import Breadcrumbs from 'react-breadcrumbs';

var Layout = React.createClass ({
  componentDidMount() {
    this.props.dispatch(organizationsLoad());
  },

  selectOrganization: function(orgId) {
    this.props.dispatch(organizationSelect(orgId));
  },

  render: function() {
    if (! this.props.firstLoadComplete) {
      return (
        <div className='app-loading'>
          <div className='app-loading-contents'>
            <img className='loader' src='/images/loader_oval_light.svg' />
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <nav>
            <div className='main-nav col-8'>
              <a href='https://giantswarm.io' target='_blank'><img className='logo' src='/images/giantswarm_icon.svg' /></a>
              <IndexLink to='/' activeClassName='active'>Home</IndexLink>
              <Link to='docs' activeClassName='active'>Getting Started</Link>

              <div className='subactions'>
                <div className='organization_dropdown'>
                  {
                    (_.map(this.props.organizations.items, (x) => {return x.id;}).length === 0 && ! this.props.organizations.isFetching) ?
                    <DropdownButton title={<span>>No organizations</span>} key='2' id='org_dropdown'>
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
                  <DropdownButton title={<span>{this.props.user.email}</span>} key='1' id='user_dropdown'>
                    <MenuItem componentClass={Link} href='/account_settings' to='/account_settings'>Account Settings</MenuItem>
                    <MenuItem componentClass={Link} href='/logout' to='/logout'>Logout</MenuItem>
                  </DropdownButton>
                </div>
              </div>
            </div>

            <div className="breadcrumb-wrapper">
              <div className="main col-8">
                <Breadcrumbs routes={this.props.routes} params={this.props.params} setDocumentTitle={true}/>
              </div>
            </div>
          </nav>

          <div className='main col-8'>
            <FlashMessages />
            <Modal />
            {this.props.children}
          </div>
        </div>
      );
    }
  }
});

function mapStateToProps(state, ownProps) {
  return {
    organizations: state.entities.organizations,
    user: state.app.loggedInUser,
    selectedOrganization: state.app.selectedOrganization,
    firstLoadComplete: state.app.firstLoadComplete
  };
}

module.exports = connect(mapStateToProps)(Layout);