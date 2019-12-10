import { NavLink } from 'react-router-dom';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import Gravatar from 'react-gravatar';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  margin-left: 10px;

  .user_dropdown--toggle {
    display: inline;
    @media only screen and (max-width: ${props =>
        props.theme.breakpoints.large}px) {
      span {
        display: none;
      }
    }
  }

  .react-gravatar {
    margin-right: 8px;
  }

  display: inline;

  ul.dropdown-menu {
    background-color: #2a5874;
    border: none;
    border-radius: 5px;

    > li > a {
      color: #ddd;
      padding: 10px 20px;

      &:hover {
        background-color: transparent;
        color: ${props => props.theme.colors.white1};
      }
    }
  }

  .dropdown-toggle.btn-default {
    background-color: transparent;
    border: none;
    color: #ccd;

    &:active {
      background-color: transparent;
      color: #ccd;
      box-shadow: none;
      text-decoration: underline;
    }

    &:hover {
      background-color: transparent;
      color: ${props => props.theme.colors.white1};
      text-decoration: underline;
    }

    &:focus {
      background-color: transparent;
      color: #ccd;
    }

    &:active:focus {
      background-color: transparent;
      color: ${props => props.theme.colors.white1};
    }

    ul.dropdown-menu {
      background-color: ${props => props.theme.colors.shade1};
      box-shadow: none;
    }
  }

  .open .dropdown-toggle.btn-default {
    background-color: transparent;
    color: ${props => props.theme.colors.white1};
    box-shadow: none;
  }
`;

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
