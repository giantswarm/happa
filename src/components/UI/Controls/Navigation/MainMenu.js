import { CSSBreakpoints } from 'model/constants';
import { homeURL } from 'model/constants/docs';
import {
  AppsRoutes,
  MainRoutes,
  OrganizationsRoutes,
  UsersRoutes,
} from 'model/constants/routes';
import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { mq } from 'styles';
import DropdownMenu, { List } from 'UI/Controls/DropdownMenu';

import Hamburger from './Hamburger';

// Derive grafana URL from the OIDC audience URL.
// We remove the dev port :8000 in case it's there.
let monitoringURL = null;
if (window.featureFlags.FEATURE_MONITORING) {
  const audienceURL = new URL(window.config.audience);
  const hostnameParts = audienceURL.host.split('.');
  hostnameParts[0] = 'grafana';
  audienceURL.host = hostnameParts.join('.');
  audienceURL.pathname = '/';
  audienceURL.search = '?orgId=1';
  monitoringURL = audienceURL.toString();
}

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
  position: static;
  margin: 0 8px;

  .active {
    font-weight: 700;
  }

  ${mq(CSSBreakpoints.Medium)} {
    display: flex;
    align-items: center;
  }
`;

const DropdownList = styled(List)`
  left: 4px;
  line-height: 1.45em;
  margin-top: 10px;
  width: calc(100vw - 8px);
`;

const DropdownNavLink = styled(StyledNavLink)`
  display: block;
  font-size: 16px;
  font-weight: 400;
  padding: 20px 30px;
`;

const DropdownAnchor = DropdownNavLink.withComponent('a');

function MainMenu({ showApps, showUsers }) {
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
        {showUsers && (
          <StyledNavLink activeClassName='active' to={UsersRoutes.Home}>
            Users
          </StyledNavLink>
        )}
        {monitoringURL && (
          <StyledExternalNavLink
            href={monitoringURL}
            rel='noopener noreferrer'
            target='_blank'
          >
            Monitoring <i className='fa fa-open-in-new' />
          </StyledExternalNavLink>
        )}
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
                {showUsers && (
                  <li>
                    <DropdownNavLink
                      activeClassName='active'
                      to={UsersRoutes.Home}
                      onClick={onClickHandler}
                    >
                      Users
                    </DropdownNavLink>
                  </li>
                )}
                {monitoringURL && (
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
                )}
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

export default MainMenu;
