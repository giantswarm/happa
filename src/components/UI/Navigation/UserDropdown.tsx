import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import Gravatar from 'react-gravatar';
import { NavLink } from 'react-router-dom';
import { AuthorizationTypes } from 'shared/constants';
import { AccountSettingsRoutes, OtherRoutes } from 'shared/constants/routes';
import FeatureFlags from 'shared/FeatureFlags';
import DropdownMenu, { DropdownTrigger, List } from 'UI/DropdownMenu';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledDropdownTrigger = styled(DropdownTrigger)`
  width: unset;
  height: unset;
  display: flex;
  align-items: center;
  position: relative;
  color: ${(props) => props.theme.colors.white5};
  font-size: 14px;
  line-height: 2;
  cursor: pointer;
  background: transparent;

  &:active,
  &:focus {
    color: ${(props) => props.theme.colors.white3};
    background-color: ${(props) => props.theme.colors.shade1};
  }

  &:hover,
  &:active:focus {
    color: ${(props) => props.theme.colors.white1};
    background: transparent;
    text-decoration: underline;
  }

  .caret {
    margin-left: ${({ theme }) => theme.spacingPx}px;
  }
`;

const StyledList = styled(List)`
  right: 0;
  left: 0;
  top: 100%;
  width: 100%;
`;

const MenuItem = styled(NavLink)`
  color: ${(props) => props.theme.colors.white1};
  display: block;
  line-height: 1;
  font-weight: 400;
  white-space: nowrap;
  color: ${(props) => props.theme.colors.white4};
  padding: ${({ theme }) => theme.spacingPx * 3}px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.shade9};
    color: ${(props) => props.theme.colors.white1};
  }
`;

const StyledGravatar = styled(Gravatar)`
  margin-right: ${({ theme }) => theme.spacingPx * 2}px;
  width: 1.6em;
  height: 1.6em;
`;

interface IUserDropdownProps {
  user: ILoggedInUser;
}

const UserDropdown: React.FC<IUserDropdownProps> = ({ user }) => {
  return (
    <Wrapper>
      <DropdownMenu
        render={({
          isOpen,
          onClickHandler,
          onFocusHandler,
          onBlurHandler,
          onKeyDownHandler,
        }) => (
          <div onBlur={onBlurHandler} onFocus={onFocusHandler}>
            <StyledDropdownTrigger
              aria-expanded={isOpen}
              aria-haspopup='true'
              onClick={onClickHandler}
              onKeyDown={onKeyDownHandler}
              type='button'
            >
              <StyledGravatar default='mm' email={user.email} size={100} />
              <span>{user.email}</span>
              <span className='caret' />
            </StyledDropdownTrigger>
            {isOpen && (
              <StyledList>
                {user.auth.scheme === AuthorizationTypes.GS && (
                  <li role='presentation'>
                    <MenuItem
                      href={AccountSettingsRoutes.Home}
                      to={AccountSettingsRoutes.Home}
                    >
                      Account Settings
                    </MenuItem>
                  </li>
                )}
                {FeatureFlags.FEATURE_CP_ACCESS && (
                  <li role='presentation'>
                    <MenuItem
                      href={OtherRoutes.CPAccess}
                      to={OtherRoutes.CPAccess}
                    >
                      Control Plane Access
                    </MenuItem>
                  </li>
                )}
                <li role='presentation'>
                  <MenuItem href={OtherRoutes.Logout} to={OtherRoutes.Logout}>
                    Logout
                  </MenuItem>
                </li>
              </StyledList>
            )}
          </div>
        )}
      />
    </Wrapper>
  );
};

UserDropdown.propTypes = {
  // @ts-expect-error
  user: PropTypes.object.isRequired,
};

export default UserDropdown;
