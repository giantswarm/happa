import { logo } from 'images';
import React from 'react';
import { Breadcrumbs } from 'react-breadcrumbs';
import { Link } from 'react-router-dom';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { CSSBreakpoints } from 'shared/constants';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import { MainRoutes } from 'shared/constants/routes';
import styled from 'styled-components';
import { mq } from 'styles';

import MainMenu from './MainMenu';
import OrganizationDropdown from './OrganizationDropdown';
import UserDropdown from './UserDropdown';

const OuterNav = styled.nav`
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  z-index: 1;
  background-color: ${(props) => props.theme.colors.shade1};

  a {
    text-decoration: none;
  }

  .currentuser {
    color: #97a8b2;
    margin-right: 18px;
  }

  .main-nav {
    margin: auto;
    padding: 0px 10px;
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
    padding: 0px 10px;
  }

  .breadcrumbs__separator {
    margin: 0px 4px;
  }

  .breadcrumbs__crumb--active {
    color: ${({ theme }) => theme.colors.darkBlueLighter9};
  }
`;

const Actions = styled.div`
  margin-left: auto;
  display: flex;

  > * + * {
    margin-left: ${({ theme }) => theme.spacingPx * 4}px;
  }
`;

// eslint-disable-next-line react/prefer-stateless-function
class Navigation extends React.Component {
  render() {
    return (
      <OuterNav>
        <div className='main-nav'>
          <RUMActionTarget name={RUMActions.ClickMainNavLogo}>
            <Link to={MainRoutes.Home}>
              <img className='logo' src={logo} width='22' height='22' />
            </Link>
          </RUMActionTarget>
          <MainMenu
            showApps={this.props.showApps}
            showUsers={this.props.showUsers}
          />

          <Actions>
            <OrganizationDropdown
              onSelectOrganization={this.props.onSelectOrganization}
              organizations={this.props.organizations}
              selectedOrganization={this.props.selectedOrganization}
            />
            &nbsp; &nbsp;
            <UserDropdown user={this.props.user} />
          </Actions>
        </div>

        <BreadcrumbWrapper data-testid='breadcrumbs'>
          <Breadcrumbs />
        </BreadcrumbWrapper>
      </OuterNav>
    );
  }
}

export default Navigation;
