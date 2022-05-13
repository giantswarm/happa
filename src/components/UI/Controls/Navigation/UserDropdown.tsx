import { AuthorizationTypes, CSSBreakpoints } from 'model/constants';
import { AccountSettingsRoutes, MainRoutes } from 'model/constants/routes';
import { LoggedInUserTypes } from 'model/stores/main/types';
import React from 'react';
import Gravatar from 'react-gravatar';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { mq } from 'styles';
import DropdownMenu, { DropdownTrigger, List } from 'UI/Controls/DropdownMenu';
import Truncated from 'UI/Util/Truncated';

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
  padding: 0 ${({ theme }) => theme.spacingPx * 2}px;

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
    margin-left: 0;
  }
`;

const StyledList = styled(List)`
  right: 0;
  top: 100%;
  width: 100%;
  min-width: 160px;
`;

const MenuItem = styled(NavLink)`
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
  margin-top: ${({ theme }) => theme.spacingPx}px;
  margin-bottom: ${({ theme }) => theme.spacingPx}px;
  margin-right: ${({ theme }) => theme.spacingPx * 2}px;
  width: 26px;
  height: 26px;
`;

const Username = styled.div`
  margin-right: ${({ theme }) => theme.spacingPx}px;

  ${mq(CSSBreakpoints.Large)} {
    display: none;
  }
`;

interface IUserDropdownProps {
  user: ILoggedInUser;
}

const UserDropdown: React.FC<React.PropsWithChildren<IUserDropdownProps>> = ({
  user,
}) => {
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
              <Username>
                <Truncated tooltipPlacement='bottom' aria-label={user.email}>
                  {user.email}
                </Truncated>
              </Username>
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

                {user.isAdmin && (
                  <li role='presentation'>
                    <MenuItem
                      href={AccountSettingsRoutes.Experiments}
                      to={AccountSettingsRoutes.Experiments}
                      onClick={onBlurHandler}
                    >
                      <i
                        className='fa fa-experiment'
                        role='presentation'
                        aria-hidden='true'
                      />{' '}
                      Experiments
                    </MenuItem>
                  </li>
                )}

                {user.type === LoggedInUserTypes.MAPI && (
                  <li role='presentation'>
                    <MenuItem
                      href={AccountSettingsRoutes.Permissions}
                      to={AccountSettingsRoutes.Permissions}
                      onClick={onBlurHandler}
                    >
                      <i
                        className='fa fa-lock'
                        role='presentation'
                        aria-hidden='true'
                      />{' '}
                      Permissions
                    </MenuItem>
                  </li>
                )}

                <li role='presentation'>
                  <MenuItem href={MainRoutes.Logout} to={MainRoutes.Logout}>
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

export default UserDropdown;
