import styled from '@emotion/styled';
import { logo } from 'images';
import PropTypes from 'prop-types';
import React from 'react';
import { Breadcrumbs } from 'react-breadcrumbs';
import { Link } from 'react-router-dom';
import { CSSBreakpoints } from 'shared/constants';
import { AppRoutes } from 'shared/constants/routes';
import { mq } from 'styles';

import MainMenu from './MainMenu';
import OrganizationDropdown from './OrganizationDropdown';
import UserDropdown from './UserDropdown';

const OuterNav = styled.nav`
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  background-color: ${(props) => props.theme.colors.shade1};

  a {
    text-decoration: none;
  }

  .main-nav {
    margin: auto;
    padding: 0 10px;
    display: flex;

    @media only screen and (max-width: ${(props) =>
        props.theme.breakpoints.large}px) and (min-width: ${(props) =>
        props.theme.breakpoints.med}px) {
      min-width: 800px;
    }

    .nav-toggle {
      float: right;
      display: none;
      font-size: 22px;
      color: #e8e8e8;
      cursor: pointer;
      ${mq(CSSBreakpoints.Large)} {
        display: block;
      }
    }
  }

  .subactions {
    margin-left: auto;

    a:last-child {
      margin-right: 0;
    }
  }

  .logo {
    width: 22px;
    height: 22px;
    vertical-align: middle;
    position: relative;
    top: -1px;
  }
`;

const BreadcrumbWrapper = styled.div`
  line-height: 20px;
  background-color: ${({ theme }) => theme.colors.shade3};
  padding: 7px;
  border-bottom: ${({ theme }) => theme.colors.shade6} 1px solid;
  border-top: ${({ theme }) => theme.colors.shade1} 1px solid;
  font-size: 11px;
  clear: both;

  ${mq(CSSBreakpoints.Large)} {
    display: none;
  }

  a {
    color: ${({ theme }) => theme.colors.darkBlueLighter6};
  }

  .breadcrumbs {
    max-width: 1200px;
    margin: auto;
    padding: 0 10px;
  }

  .breadcrumbs__separator {
    margin: 0 4px;
  }

  .breadcrumbs__crumb--active {
    color: ${({ theme }) => theme.colors.darkBlueLighter9};
  }
`;

// eslint-disable-next-line react/prefer-stateless-function
class Navigation extends React.Component {
  render() {
    return (
      <OuterNav>
        <div className='main-nav'>
          <Link to={AppRoutes.Home}>
            <img className='logo' src={logo} alt='Giant Swarm' />
          </Link>
          <MainMenu
            showAppCatalog={this.props.showAppCatalog}
            isUserAdmin={this.props.user.isAdmin}
          />

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

        <BreadcrumbWrapper>
          <Breadcrumbs />
        </BreadcrumbWrapper>
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
