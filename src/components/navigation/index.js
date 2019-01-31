'use strict';

import _ from 'underscore';
import { connect } from 'react-redux';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import Gravatar from 'react-gravatar';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { organizationSelect } from '../../actions/organizationActions';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumbs } from 'react-breadcrumbs';
import { NavLink } from 'react-router-dom';

class Navigation extends React.Component {
  selectOrganization = orgId => {
    this.props.dispatch(organizationSelect(orgId));
  };

  render() {
    return (
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
                    to={'/organizations/' + this.props.selectedOrganization}
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
                <MenuItem componentClass={NavLink} href='/logout' to='/logout'>
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
    );
  }
}

Navigation.propTypes = {
  user: PropTypes.object,
  organizations: PropTypes.object,
  selectedOrganization: PropTypes.string,
  dispatch: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

module.exports = connect(
  () => {
    return {};
  },
  mapDispatchToProps
)(Navigation);
