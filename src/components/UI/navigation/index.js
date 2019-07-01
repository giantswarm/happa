import { Breadcrumbs } from 'react-breadcrumbs';
import { NavLink } from 'react-router-dom';
import { withTheme } from 'emotion-theming';
import OrganizationDropdown from './organization_dropdown';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import UserDropdown from './user_dropdown';

const OuterNav = withTheme(
  styled.nav(props => ({
    height: '50px',
    lineHeight: '50px',
    fontSize: '14px',
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    zIndex: '1',
    backgroundColor: '#1a384b',

    a: {
      textDecoration: 'none',
    },

    '.currentuser': {
      color: '#97a8b2',
      marginRight: '18px',
    },

    '.main-nav': {
      margin: 'auto',

      [`@media only screen and (max-width: ${props.theme.breakpoints.large}px) and (min-width: ${props.theme.breakpoints.med}px)`]: {
        minWidth: 800,
      },

      '&> a': {
        float: 'left',
      },

      '.nav-toggle': {
        float: 'right',
        display: 'none',
        fontSize: '22px',
        color: '#e8e8e8',
        cursor: 'pointer',
        [`@media only screen and (max-width: ${props.theme.breakpoints.large})px`]: {
          display: 'block',
        },
      },
    },

    '.nav-responsive': {
      float: 'left',
      paddingLeft: 20,
      height: 40,

      '&> a': {
        textDecoration: 'none',
        color: '#eee',
        marginRight: 18,

        '&:last-child': {
          marginRight: 0,
        },

        '&:hover': {
          color: props.theme.colors.white1,
        },
      },

      [`@media only screen and (max-width: ${props.theme.breakpoints.large}px)`]: {
        position: 'fixed',
        top: 50,
        backgroundColor: '#265068',
        borderTop: '1px solid #29566f',
        borderBottom: '1px solid #29566f',
        width: '100%',
        left: 0,
        paddingLeft: 0,
        height: 'auto',
        textAlign: 'center',
      },
    },

    '.subactions': {
      float: 'right',
      [`@media only screen and (max-width: ${props.theme.breakpoints.large}px)`]: {
        marginRight: 10,
      },

      'a:last-child': {
        marginRight: 0,
      },
    },

    '.logo': {
      width: '22px',
      height: '22px',
      verticalAlign: 'middle',
      position: 'relative',
      top: '-1px',
      [`@media only screen and (max-width: ${props.theme.breakpoints.med}px)`]: {
        marginLeft: 10,
      },
    },
  }))
);

class Navigation extends React.Component {
  render() {
    return (
      <OuterNav>
        <div className='main-nav col-9'>
          <a
            href='https://giantswarm.io'
            rel='noopener noreferrer'
            target='_blank'
          >
            <img className='logo' src='/images/giantswarm_icon.svg' />
          </a>
          <div className='nav-responsive'>
            <NavLink activeClassName='active' exact to='/'>
              Clusters
            </NavLink>
            <NavLink activeClassName='active' to='/organizations/'>
              Organizations
            </NavLink>
            {this.props.showAppCatalog && (
              <NavLink activeClassName='active' exact to='/apps/'>
                Apps
              </NavLink>
            )}
            {this.props.user.isAdmin ? (
              <NavLink activeClassName='active' to='/users/'>
                Users
              </NavLink>
            ) : (
              undefined
            )}
            <a
              href='https://docs.giantswarm.io'
              rel='noopener noreferrer'
              target='_blank'
            >
              Documentation <i className='fa fa-open-in-new' />
            </a>
          </div>

          <div className='subactions'>
            <OrganizationDropdown
              onSelectOrganization={this.props.onSelectOrganization}
              organizations={this.props.organizations}
              selectedOrganization={this.props.selectedOrganization}
            />
            &nbsp; &nbsp;
            <UserDropdown user={this.props.user} />
          </div>
        </div>

        <div className='breadcrumb-wrapper'>
          <div className='main col-9'>
            <Breadcrumbs />
          </div>
        </div>
      </OuterNav>
    );
  }
}

Navigation.propTypes = {
  user: PropTypes.object,
  showAppCatalog: PropTypes.bool,
  organizations: PropTypes.object,
  onSelectOrganization: PropTypes.func,
  selectedOrganization: PropTypes.string,
};

export default Navigation;
