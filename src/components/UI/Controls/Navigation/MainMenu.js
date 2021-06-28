import { homeURL } from 'lib/docs';
import PropTypes from 'prop-types';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { CSSBreakpoints } from 'shared/constants';
import {
  AppsRoutes,
  MainRoutes,
  OrganizationsRoutes,
  UsersRoutes,
} from 'shared/constants/routes';
import styled from 'styled-components';
import { mq } from 'styles';
import DropdownMenu, { List } from 'UI/Controls/DropdownMenu';

import Hamburger from './Hamburger';

// Derive grafana URL from the OIDC audience URL.
// We remove the dev port :8000 in case it's there.
const mapiURL = new URL(window.config.audience);
const hostnameParts = mapiURL.host.split('.');
hostnameParts[0] = 'grafana';
mapiURL.host = hostnameParts.join('.');
mapiURL.pathname = '/';
mapiURL.search = '?orgId=1';
const monitoringURL = mapiURL.toString();

const StyledNavLink = styled(NavLink)`
  text-decoration: none;
  color: ${(props) => props.theme.colors.white4};
  margin-right: 18px;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    color: ${(props) => props.theme.colors.white1};
  }
`;

const StyledExternalNavLink = styled.a`
  display: inline-block;
  margin-right: 18px;
`;

const NavDiv = styled.div`
  float: left;
  padding-left: 20px;
  height: 40px;

  ${mq(CSSBreakpoints.Medium)} {
    display: none;
  }
`;

const DropdownMenuStyled = styled(DropdownMenu)`
  display: none;
  left: unset;
  flex-direction: column;
  transform: translate(30px, 5px);
  position: fixed;
  width: 38px;

  .active {
    font-weight: 700;
  }

  ${mq(CSSBreakpoints.Medium)} {
    display: flex;
  }
`;

const DropdownList = styled(List)`
  right: unset;
  left: -35px;
  line-height: 1.45em;
  margin: 7px 0 0 -1px;
  width: calc(100vw - 8px);
`;

const DropdownNavLink = styled(StyledNavLink)`
  display: block;
  font-size: 16px;
  font-weight: 400;
  padding: 20px 30px;
`;

const DropdownAnchor = DropdownNavLink.withComponent('a');

function MainMenu({ showApps, isUserAdmin }) {
  return (
    <>
      <NavDiv>
        <StyledNavLink activeClassName='active' exact to={MainRoutes.Home}>
          Clusters
        </StyledNavLink>
        <StyledNavLink activeClassName='active' to={OrganizationsRoutes.Home}>
          Organizations
        </StyledNavLink>
        {showApps && (
          <StyledNavLink activeClassName='active' to={AppsRoutes.Home}>
            Apps
          </StyledNavLink>
        )}
        {isUserAdmin ? (
          <StyledNavLink activeClassName='active' to={UsersRoutes.Home}>
            Users
          </StyledNavLink>
        ) : undefined}
        <StyledExternalNavLink
          href={monitoringURL}
          rel='noopener noreferrer'
          target='_blank'
        >
          Monitoring <i className='fa fa-open-in-new' />
        </StyledExternalNavLink>
        <StyledExternalNavLink
          href={homeURL}
          rel='noopener noreferrer'
          target='_blank'
        >
          Documentation <i className='fa fa-open-in-new' />
        </StyledExternalNavLink>
      </NavDiv>
      {/* Mobile menu */}
      <DropdownMenuStyled
        render={({
          isOpen,
          onClickHandler,
          onFocusHandler,
          onBlurHandler,
          onKeyDownHandler,
        }) => (
          <div onBlur={onBlurHandler} onFocus={onFocusHandler} tabIndex='0'>
            <Hamburger
              isOpen={isOpen}
              onClickHandler={onClickHandler}
              onKeyDownHandler={onKeyDownHandler}
            />
            {isOpen && (
              <DropdownList role='menu'>
                <li>
                  <DropdownNavLink
                    activeClassName='active'
                    exact
                    to={MainRoutes.Home}
                    onClick={onClickHandler}
                  >
                    Clusters
                  </DropdownNavLink>
                </li>
                <li>
                  <DropdownNavLink
                    activeClassName='active'
                    to={OrganizationsRoutes.Home}
                    onClick={onClickHandler} // This closes the dropdown.
                  >
                    Organizations
                  </DropdownNavLink>
                </li>
                {showApps && (
                  <li>
                    <DropdownNavLink
                      activeClassName='active'
                      to={AppsRoutes.Home}
                      onClick={onClickHandler}
                    >
                      Apps
                    </DropdownNavLink>
                  </li>
                )}
                {isUserAdmin ? (
                  <li>
                    <DropdownNavLink
                      activeClassName='active'
                      to={UsersRoutes.Home}
                      onClick={onClickHandler}
                    >
                      Users
                    </DropdownNavLink>
                  </li>
                ) : undefined}
                <li>
                  <DropdownAnchor
                    href={monitoringURL}
                    rel='noopener noreferrer'
                    target='_blank'
                    onClick={onClickHandler}
                  >
                    Monitoring <i className='fa fa-open-in-new' />
                  </DropdownAnchor>
                </li>
                <li>
                  <DropdownAnchor
                    href={homeURL}
                    rel='noopener noreferrer'
                    target='_blank'
                    onClick={onClickHandler}
                  >
                    Documentation <i className='fa fa-open-in-new' />
                  </DropdownAnchor>
                </li>
              </DropdownList>
            )}
          </div>
        )}
      />
    </>
  );
}

MainMenu.propTypes = {
  showApps: PropTypes.bool,
  isUserAdmin: PropTypes.bool,
};

export default MainMenu;
