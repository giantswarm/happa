import { MainRoutes, OrganizationsRoutes } from 'model/constants/routes';
import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import DropdownMenu, { DropdownTrigger, List } from 'UI/Controls/DropdownMenu';
import Truncated from 'UI/Util/Truncated';
import RoutePath from 'utils/routePath';

const OrganizationDropdownTrigger = styled(DropdownTrigger)`
  width: unset;
  height: unset;
  display: inline-block;
  position: relative;
  padding: 0 12px 0 0;
  margin: 0;
  text-decoration: none;
  background-color: ${(props) => props.theme.colors.shade2};
  border-radius: 5px;
  border: none;
  border-top: 1px solid #2e617f;
  border-bottom: 1px solid #183343;
  color: #ccd;
  font-size: 14px;
  line-height: 32px;
  cursor: pointer;
  text-align: center;
  will-change: background-color;
  transition: background-color 0.3s;

  &:active {
    color: #ccd;
    background-color: ${(props) => props.theme.colors.shade2};
  }

  &:focus {
    background-color: ${(props) => props.theme.colors.shade2};
    color: #ccd;
  }

  &:hover {
    background-color: ${(props) => props.theme.colors.shade5} !important;
    color: ${(props) => props.theme.colors.white1};
  }

  &:active:focus {
    background-color: ${(props) => props.theme.colors.shade5} !important;
    color: ${(props) => props.theme.colors.white1};
  }

  &:before {
    content: 'ORG';
    border-radius: 5px 0px 0px 5px;
    background-color: #2e617f;
    position: absolute;
    padding: 0 10px;
    font-weight: normal;
    letter-spacing: 0.5px;
    color: #fff;
    font-size: 75%;
  }

  .caret {
    margin-left: 4px;
  }
`;

const TriggerLabel = styled(Truncated)`
  margin-left: 50px;
`;

const OrganizationMenu = styled(DropdownMenu)`
  display: inline;
`;

const InlineDiv = styled.div`
  display: inline;
`;

const OrganizationList = styled(List)`
  right: 0;
  left: 0;
  top: 24px;
`;

const MenuItem = styled(NavLink)`
  color: ${(props) => props.theme.colors.white1};
  padding: 8px 15px;
  display: block;
  clear: both;
  font-weight: 400;
  line-height: 1.42857143;
  white-space: nowrap;

  &:hover {
    background-color: ${({ theme }) => theme.colors.shade9};
    color: ${(props) => props.theme.colors.white1};
  }
`;

const Divider = styled.li`
  height: 1px;
  overflow: hidden;
  background-color: transparent;
  border-bottom: 1px solid ${({ theme }) => theme.colors.shade6};
  border-top: 1px solid ${({ theme }) => theme.colors.shade3};
  margin: 0;
`;

const MenuHeader = styled.div`
  color: #ccc;
  margin-top: 10px;
  padding: 3px 15px;
  display: block;
  font-size: 12px;
  line-height: 1.42857143;
  white-space: nowrap;
`;

const ScrollableOrganizations = styled.div`
  overflow: auto;
  max-height: 50vh;
  overscroll-behavior: contain;
`;

const OrganizationDropdown = ({
  organizations,
  selectedOrganization,
  onSelectOrganization,
}) => {
  const organizationDetailPath = useMemo(
    () =>
      RoutePath.createUsablePath(OrganizationsRoutes.Detail, {
        orgId: selectedOrganization,
      }),
    [selectedOrganization]
  );

  const sortedOrganizations = useMemo(() => {
    if (organizations.isFetching) {
      return [];
    }

    return Object.values(organizations.items)
      .map(({ id }) => id)
      .sort((a, b) => a.localeCompare(b));
  }, [organizations.items, organizations.isFetching]);

  return (
    <InlineDiv>
      <OrganizationMenu
        render={({
          isOpen,
          onClickHandler,
          onFocusHandler,
          onBlurHandler,
          onKeyDownHandler,
        }) => (
          <InlineDiv onBlur={onBlurHandler} onFocus={onFocusHandler}>
            <OrganizationDropdownTrigger
              aria-expanded={isOpen}
              aria-haspopup='true'
              onClick={onClickHandler}
              onKeyDown={onKeyDownHandler}
              type='button'
            >
              {sortedOrganizations.length !== 0 ? (
                <TriggerLabel tooltipPlacement='bottom'>
                  {selectedOrganization}
                </TriggerLabel>
              ) : (
                'No Organizations'
              )}
              <span className='caret' />
            </OrganizationDropdownTrigger>
            {isOpen && (
              <OrganizationList role='menu'>
                {sortedOrganizations.length !== 0 && (
                  <>
                    <li role='presentation'>
                      <MenuItem
                        href={organizationDetailPath}
                        to={organizationDetailPath}
                        activeClassName=''
                        onClick={onClickHandler}
                      >
                        Details for {selectedOrganization}
                      </MenuItem>
                    </li>
                    <Divider role='separator' />
                  </>
                )}
                <li role='presentation'>
                  <MenuItem
                    href={OrganizationsRoutes.List}
                    to={OrganizationsRoutes.List}
                    activeClassName=''
                    onClick={onClickHandler}
                  >
                    Manage organizations
                  </MenuItem>
                </li>
                {sortedOrganizations.length !== 0 && (
                  <>
                    <Divider role='separator' />
                    <MenuHeader role='heading'>Switch Organization</MenuHeader>
                    <ScrollableOrganizations>
                      {sortedOrganizations.map((org) => (
                        <li role='presentation' key={org}>
                          <MenuItem
                            href={MainRoutes.Home}
                            to={MainRoutes.Home}
                            activeClassName=''
                            onClick={() => {
                              onSelectOrganization(org);
                              onClickHandler();
                            }}
                            title={`Switch to ${org}`}
                          >
                            {org}
                          </MenuItem>
                        </li>
                      ))}
                    </ScrollableOrganizations>
                  </>
                )}
              </OrganizationList>
            )}
          </InlineDiv>
        )}
      />
    </InlineDiv>
  );
};

export default OrganizationDropdown;
