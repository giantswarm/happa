import { NavLink } from 'react-router-dom';
import { withTheme } from 'emotion-theming';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import Gravatar from 'react-gravatar';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = withTheme(
  styled.div(props => ({
    marginLeft: 10,

    '.user_dropdown--toggle': {
      display: 'inline',
      [`@media only screen and (max-width: ${props.theme.breakpoints.large}px)`]: {
        span: {
          display: 'none',
        },
      },
    },

    '.react-gravatar': {
      marginRight: 8,
    },

    display: 'inline',

    'ul.dropdown-menu': {
      backgroundColor: '#2a5874',
      border: 'none',
      borderRadius: 5,

      '>li>a': {
        color: '#ddd',
        padding: '10px 20px',

        '&:hover': {
          backgroundColor: 'transparent',
          color: props.theme.colors.white1,
        },
      },
    },

    '.dropdown-toggle.btn-default': {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#ccd',

      '&:active': {
        backgroundColor: 'transparent',
        color: '#ccd',
        boxShadow: 'none',
        textDecoration: 'underline',
      },

      '&:hover': {
        backgroundColor: 'transparent',
        color: props.theme.colors.white1,
        textDecoration: 'underline',
      },

      '&:focus': {
        backgroundColor: 'transparent',
        color: '#ccd',
      },

      '&:active:focus': {
        backgroundCOlor: 'transparent',
        color: props.theme.colors.white1,
      },

      'ul.dropdown-menu': {
        backgroundColor: props.theme.colors.shade1,
        boxShadow: 'none',
      },
    },

    '.open .dropdown-toggle.btn-default': {
      backgroundColor: 'transparent',
      color: props.theme.colors.white1,
      boxShadow: 'none',
    },
  }))
);

class UserDropdown extends React.Component {
  render() {
    return (
      <Wrapper>
        <DropdownButton
          id='user_dropdown'
          key='1'
          pullRight={true}
          ref={d => {
            this.user_dropdown = d;
          }}
          title={
            <div className='user_dropdown--toggle'>
              <Gravatar default='mm' email={this.props.user.email} size={100} />
              <span>{this.props.user.email}</span>
            </div>
          }
        >
          {this.props.user.auth.scheme === 'giantswarm' ? (
            <MenuItem
              componentClass={NavLink}
              href='/account-settings/'
              to='/account-settings/'
            >
              Account Settings
            </MenuItem>
          ) : (
            undefined
          )}
          <MenuItem componentClass={NavLink} href='/logout' to='/logout'>
            Logout
          </MenuItem>
        </DropdownButton>
      </Wrapper>
    );
  }
}

UserDropdown.propTypes = {
  user: PropTypes.object,
};

export default UserDropdown;
