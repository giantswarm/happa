import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { CSSBreakpoints } from 'shared/constants';
import {
  AppCatalogRoutes,
  AppRoutes,
  OrganizationsRoutes,
  UsersRoutes,
} from 'shared/constants/routes';
import { mq } from 'styles';
import DropdownMenu, { List } from 'UI/DropdownMenu';

import Hamburger from './Hamburger';

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

function MainMenu({ showAppCatalog, isUserAdmin }) {
  return (
    <>
      <NavDiv>
        <StyledNavLink
          activeClassName='active'
          exact
          to={AppRoutes.Home}
          data-dd-action-name='CLICK_MAINNAV_CLUSTERS'
        >
          Clusters
        </StyledNavLink>
        <StyledNavLink
          activeClassName='active'
          to={OrganizationsRoutes.Home}
          data-dd-action-name='CLICK_MAINNAV_ORGANIZATIONS'
        >
          Organizations
        </StyledNavLink>
        {showAppCatalog && (
          <StyledNavLink
            activeClassName='active'
            to={AppCatalogRoutes.Home}
            data-dd-action-name='CLICK_MAINNAV_APPCATALOGS'
          >
            App Catalogs
          </StyledNavLink>
        )}
        {isUserAdmin ? (
          <StyledNavLink
            activeClassName='active'
            to={UsersRoutes.Home}
            data-dd-action-name='CLICK_MAINNAV_USERS'
          >
            Users
          </StyledNavLink>
        ) : undefined}
        <a
          href='https://docs.giantswarm.io'
          rel='noopener noreferrer'
          target='_blank'
          data-dd-action-name='CLICK_MAINNAV_DOCUMENTATION'
        >
          Documentation <i className='fa fa-open-in-new' />
        </a>
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
                    to={AppRoutes.Home}
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
                {showAppCatalog && (
                  <li>
                    <DropdownNavLink
                      activeClassName='active'
                      to={AppCatalogRoutes.Home}
                      onClick={onClickHandler}
                    >
                      App Catalogs
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
                    href='https://docs.giantswarm.io'
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
  showAppCatalog: PropTypes.bool,
  isUserAdmin: PropTypes.bool,
};

export default MainMenu;
