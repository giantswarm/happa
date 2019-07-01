import { NavLink } from 'react-router-dom';
import { withTheme } from 'emotion-theming';
import _ from 'underscore';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = withTheme(
  styled.div(props => ({
    display: 'inline',

    'ul.dropdown-menu': {
      backgroundColor: '#2a5874',
      border: 'none',
      borderRadius: 5,

      '.dropdown-header': {
        color: '#ccc',
        marginTop: 10,
        padding: '3px 15px',
      },

      '.divider': {
        backgroundColor: 'transparent',
        borderBottom: `1px solid ${props.theme.colors.shade5}`,
        borderTop: `1px solid ${props.theme.colors.shade1}`,
        margin: 0,
      },

      '>li>a': {
        color: '#ddd',
        padding: '10px 20px',

        '&:hover': {
          backgroundColor: 'transparent',
          color: props.theme.colors.white1,
        },
      },
    },

    '.open .dropdown-toggle.btn-default': {
      backgroundColor: 'transparent',
      color: props.theme.colors.white1,
      boxShadow: 'none',
    },

    '.dropdown-toggle.btn-default': {
      backgroundColor: props.theme.colors.shade2,
      borderRadius: 5,
      borderTop: `1px solid ${props.theme.colors.shade4}`,
      borderBottom: `1px solid ${props.theme.colors.shade1}`,
      position: 'relative',
      paddingLeft: 50,
      border: 'none',
      color: '#ccd',

      '.label': {
        marginRight: 10,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        lineHeight: '29px',
        borderRadius: 0,
        borderTopLeftRadius: 5,
        borderBottomLeftRadius: 5,
        backgroundColor: props.theme.colors.shade4,
        paddingLeft: 10,
        paddingRight: 10,
        fontWeight: 'normal',
        letterSpacing: 0.5,
      },

      '&:active': {
        color: '#ccd',
        textDecoration: 'none',
        boxShadow: 'none',
        backgroundColor: props.theme.colors.shade2,
      },

      '&:focus': {
        backgroundColor: props.theme.colors.shade2,
        color: '#ccd',
      },

      '&:hover': {
        textDecoration: 'none',
        backgroundColor: props.theme.colors.shade3,
        color: props.theme.colors.white1,
      },

      '&:active:focus': {
        backgroundColor: 'transparent',
        color: props.theme.colors.white1,
      },

      'ul.dropdown-menu': {
        backgroundColor: props.theme.colors.shade1,
        boxShadow: 'none',
      },
    },

    '.open': {
      '.dropdown-toggle.btn-default': {
        backgroundColor: props.theme.colors.shade1,
        borderBottom: `1px solid ${props.theme.colors.shade5}`,
        borderTop: `1px solid ${props.theme.colors.shade1}`,
      },
    },
  }))
);

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
              to={'/organizations/' + this.props.selectedOrganization}
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
