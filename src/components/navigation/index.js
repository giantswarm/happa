'use strict';

import { Breadcrumbs } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { organizationSelect } from '../../actions/organizationActions';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import Gravatar from 'react-gravatar';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';

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
            <NavLink exact to='/' activeClassName='active'>
              Clusters
            </NavLink>
            <NavLink to='/organizations/' activeClassName='active'>
              Organizations
            </NavLink>
            {this.props.user.isAdmin ? (
              <NavLink to='/users/' activeClassName='active'>
                Users
              </NavLink>
            ) : (
              undefined
            )}
            <a
              href='https://docs.giantswarm.io'
              target='_blank'
              rel='noopener noreferrer'
            >
              Documentation <i className='fa fa-open-in-new' />
            </a>
          </div>

          <div className='subactions'>
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

export default connect(
  () => {
    return {};
  },
  mapDispatchToProps
)(Navigation);
