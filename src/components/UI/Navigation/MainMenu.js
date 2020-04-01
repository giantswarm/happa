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
import DropdownMenu from 'UI/DropdownMenu';

import Hamburger from './Hamburger';

const NavDiv = styled.div`
  float: left;
  padding-left: 20px;
  height: 40px;

  & > a {
    text-decoration: none;
    color: ${(props) => props.theme.colors.white4};
    margin-right: 18px;

    &:last-child {
      margin-right: 0;
    }

    &:hover {
      color: ${(props) => props.theme.colors.white1};
    }
  }

  ${mq(CSSBreakpoints.Large)} {
    display: none;
  }
`;

const DropdownMenuStyled = styled(DropdownMenu)`
  display: none;
  left: reset;
  flex-direction: column;
  transform: translate(30px, 5px);
  position: fixed;
  width: 45px;
  height: 40px;

  .dropdown-trigger {
    width: 100%;
    height: 100%;
    padding: 10px;
  }

  ul {
    right: unset;
    line-height: 1.45em;
    margin: 7px 0 0 -1px;
  }

  .active {
    font-weight: 700;
  }

  ${mq(CSSBreakpoints.Large)} {
    display: flex;
  }

  ${mq(CSSBreakpoints.Medium)} {
    transform: translate(40px, 5px);

    ul {
      width: calc(100vw - 8px);
      left: -35px;
    }

    a {
      font-size: 18px;
      padding: 20px 30px;
    }
  }
`;

function MainMenu({ showAppCatalog, isUserAdmin }) {
  return (
    <>
      <NavDiv>
        <NavLink activeClassName='active' exact to={AppRoutes.Home}>
          Clusters
        </NavLink>
        <NavLink activeClassName='active' to={OrganizationsRoutes.Home}>
          Organizations
        </NavLink>
        {showAppCatalog && (
          <NavLink activeClassName='active' to={AppCatalogRoutes.Home}>
            App Catalogs
          </NavLink>
        )}
        {isUserAdmin ? (
          <NavLink activeClassName='active' to={UsersRoutes.Home}>
            Users
          </NavLink>
        ) : undefined}
        <a
          href='https://docs.giantswarm.io'
          rel='noopener noreferrer'
          target='_blank'
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
          <div
            className='mobile-nav-div'
            onBlur={onBlurHandler}
            onFocus={onFocusHandler}
            tabIndex='0'
          >
            <Hamburger
              isOpen={isOpen}
              onClickHandler={onClickHandler}
              onKeyDownHandler={onKeyDownHandler}
            />
            {isOpen && (
              <ul role='menu'>
                <li>
                  <NavLink
                    activeClassName='active'
                    exact
                    to={AppRoutes.Home}
                    onClick={onClickHandler}
                  >
                    Clusters
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    activeClassName='active'
                    to={OrganizationsRoutes.Home}
                    onClick={onClickHandler} // This closes the dropdown.
                  >
                    Organizations
                  </NavLink>
                </li>
                {showAppCatalog && (
                  <li>
                    <NavLink
                      activeClassName='active'
                      to={AppCatalogRoutes.Home}
                      onClick={onClickHandler}
                    >
                      App Catalogs
                    </NavLink>
                  </li>
                )}
                {isUserAdmin ? (
                  <li>
                    <NavLink
                      activeClassName='active'
                      to={UsersRoutes.Home}
                      onClick={onClickHandler}
                    >
                      Users
                    </NavLink>
                  </li>
                ) : undefined}
                <li>
                  <a
                    href='https://docs.giantswarm.io'
                    rel='noopener noreferrer'
                    target='_blank'
                    onClick={onClickHandler}
                  >
                    Documentation <i className='fa fa-open-in-new' />
                  </a>
                </li>
              </ul>
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
