import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Gravatar from 'react-gravatar';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const UsrDropdown = styled(DropdownButton)`
  margin-left: 10px;

  .user_dropdown--toggle {
    display: inline-block;

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

  .dropdown-menu {
    background-color: ${props => props.theme.colors.shade1};
    border: none;
    border-radius: 5px;
    box-shadow: none;

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
      <UsrDropdown
        id='user_dropdown'
        variant='default'
        alignRight={true}
        title={
          <>
            <div className='user_dropdown--toggle'>
              <Gravatar default='mm' email={this.props.user.email} size={100} />
              <span>{this.props.user.email}</span>
            </div>
          </>
        }
      >
        {this.props.user.auth.scheme === 'giantswarm' ? (
          <Dropdown.Item
            as={NavLink}
            href='/account-settings/'
            to='/account-settings/'
          >
            Account Settings
          </Dropdown.Item>
        ) : (
          undefined
        )}
        <Dropdown.Item as={NavLink} href='/logout' to='/logout'>
          Logout
        </Dropdown.Item>
      </UsrDropdown>
    );
  }
}

UserDropdown.propTypes = {
  user: PropTypes.object,
};

export default UserDropdown;
