import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'underscore';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  display: inline;

  ul.dropdown-menu {
    background-color: #2a5874;
    border: none;
    border-radius: 5px;

    .dropdown-header {
      color: #ccc;
      margin-top: 10px;
      padding: 3px 15px;
    }

    .divider {
      background-color: transparent;
      border-bottom: 1px solid ${props => props.theme.colors.shade6};
      border-top: 1px solid ${props => props.theme.colors.shade3};
      margin: 0px;
    }

    > li > a {
      color: #ddd;
      padding: 10px 20px;

      &:hover {
        background-color: transparent;
        color: ${props => props.theme.colors.white1};
      }
    }
  }

  .open .dropdown-toggle.btn-default {
    background-color: transparent;
    color: ${props => props.theme.colors.white1};
    box-shadow: none;
  }

  .dropdown-toggle.btn-default {
    background-color: ${props => props.theme.colors.shade2};
    border-radius: 5px;
    border: none;
    border-top: 1px solid #2e617f;
    border-bottom: 1px solid #183343;
    position: relative;
    padding-left: 50px;
    color: #ccd;

    .label {
      margin-right: 10px;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      line-height: 29px;
      border-radius: 0px;
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      background-color: #2e617f;
      padding-left: 10px;
      padding-right: 10px;
      font-weight: normal;
      letter-spacing: 0.5px;
    }

    &:active {
      color: #ccd;
      text-decoration: none;
      box-shadow: none;
      background-color: ${props => props.theme.colors.shade2};
    }

    &:focus {
      background-color: ${props => props.theme.colors.shade2};
      color: #ccd;
    }

    &:hover {
      text-decoration: none;
      background-color: ${props => props.theme.colors.shade5} !important;
      color: ${props => props.theme.colors.white1};
    }

    &:active:focus {
      background-color: ${props => props.theme.colors.shade5} !important;
      color: ${props => props.theme.colors.white1};
    }

    ul.dropdown-menu {
      background-color: ${props => props.theme.colors.shade2};
      box-shadow: none;
    }
  }

  .open {
    .dropdown-toggle.btn-default {
      background-color: ${props => props.theme.colors.shade2};
      border-bottom: 1px solid #2e617f;
      border-top: 1px solid #183343;
    }
  }
`;

// eslint-disable-next-line react/prefer-stateless-function
class OrganizationDropdown extends React.Component {
  render() {
    return (
      <Wrapper>
        {Object.entries(this.props.organizations.items).length === 0 &&
        !this.props.organizations.isFetching ? (
          <DropdownButton
            id='org_dropdown'
            key='2'
            title={
              <span>
                <span className='label label-default'>ORG</span>No organizations
              </span>
            }
          >
            <MenuItem
              componentClass={NavLink}
              href='/organizations/'
              to='/organizations/'
            >
              Manage organizations
            </MenuItem>
          </DropdownButton>
        ) : (
          <DropdownButton
            id='org_dropdown'
            key='2'
            title={
              <span>
                <span className='label label-default'>ORG</span>{' '}
                {this.props.selectedOrganization}
              </span>
            }
          >
            <MenuItem
              componentClass={NavLink}
              href='/organizations/'
              to={`/organizations/${this.props.selectedOrganization}`}
            >
              Details for {this.props.selectedOrganization}
            </MenuItem>
            <MenuItem divider />
            <MenuItem
              componentClass={NavLink}
              href='/organizations/'
              to='/organizations/'
            >
              Manage organizations
            </MenuItem>
            <MenuItem divider />
            <MenuItem header>Switch Organization</MenuItem>
            {_.sortBy(this.props.organizations.items, 'id').map(org => {
              return (
                <MenuItem
                  eventKey={org.id}
                  key={org.id}
                  onSelect={this.props.onSelectOrganization}
                >
                  {org.id}
                </MenuItem>
              );
            })}
          </DropdownButton>
        )}
      </Wrapper>
    );
  }
}

OrganizationDropdown.propTypes = {
  organizations: PropTypes.object,
  onSelectOrganization: PropTypes.func,
  selectedOrganization: PropTypes.string,
};

export default OrganizationDropdown;
