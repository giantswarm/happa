import { Breadcrumbs } from 'react-breadcrumbs';
import { logo } from 'images';
import { NavLink } from 'react-router-dom';

import OrganizationDropdown from './organization_dropdown';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import UserDropdown from './user_dropdown';

const OuterNav = styled.nav`
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  z-index: 1;
  background-color: ${props => props.theme.colors.shade1};

  a {
    text-decoration: none;
  }

  .currentuser {
    color: #97a8b2;
    margin-right: 18px;
  }

  .main-nav {
    margin: auto;

    @media only screen and (max-width: ${props =>
        props.theme.breakpoints.large}px) and (min-width: ${props =>
        props.theme.breakpoints.med}px) {
      min-width: 800px;
    }

    & > a {
      float: left;
    }

    .nav-toggle {
      float: right;
      display: none;
      font-size: 22px;
      color: #e8e8e8;
      cursor: pointer;
      @media only screen and (max-width: ${props =>
          props.theme.breakpoints.large}px) {
        display: block;
      }
    }
  }

  .nav-responsive {
    float: left;
    padding-left: 20px;
    height: 40px;

    & > a {
      text-decoration: none;
      color: #eee;
      margin-right: 18px;

      &:last-child {
        margin-right: 0;
      }

      &:hover {
        color: ${props => props.theme.colors.white1};
      }
    }

    @media only screen and (max-width: ${props =>
        props.theme.breakpoints.large}px) {
      position: fixed;
      top: 50px;
      background-color: #265068;
      border-top: 1px solid #29566f;
      border-bottom: 1px solid #29566f;
      width: 100%;
      left: 0px;
      padding-left: 0px;
      height: auto;
      text-align: center;
    }
  }

  .subactions {
    float: right;
    @media only screen and (max-width: ${props =>
        props.theme.breakpoints.large}px) {
      margin-right: 10px;
    }

    a:last-child {
      margin-right: 0px;
    }
  }

  .logo {
    width: 22px;
    height: 22px;
    vertical-align: middle;
    position: relative;
    top: -1px;
    @media only screen and (max-width: ${props =>
        props.theme.breakpoints.med}px) {
      margin-left: 10px;
    }
  }
`;

class Navigation extends React.Component {
  render() {
    return (
      <OuterNav>
        <div className='main-nav col-9'>
          <a href='/'>
            <img className='logo' src={logo} />
          </a>
          <div className='nav-responsive'>
            <NavLink activeClassName='active' exact to='/'>
              Clusters
            </NavLink>
            <NavLink activeClassName='active' to='/organizations/'>
              Organizations
            </NavLink>
            {this.props.showAppCatalog && (
              <NavLink activeClassName='active' to='/app-catalogs/'>
                App Catalogs
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
