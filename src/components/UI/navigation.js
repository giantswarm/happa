import { Breadcrumbs } from 'react-breadcrumbs';
import { NavLink } from 'react-router-dom';
import { withTheme } from 'emotion-theming';
import _ from 'underscore';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import Gravatar from 'react-gravatar';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const OuterNav = withTheme(
  styled.nav(props => ({
    height: '50px',
    lineHeight: '50px',
    fontSize: '14px',
    position: 'fixed',
    top: '0px',
    left: '0px',
    right: '0px',
    zIndex: '1',
    backgroundColor: '#1a384b',

    a: {
      textDecoration: 'none',
    },

    '.currentuser': {
      color: '#97a8b2',
      marginRight: '18px',
    },

    '.main-nav': {
      margin: 'auto',

      [`@media only screen and (max-width: ${props.theme.breakpoints.large}px) and (min-width: ${props.theme.breakpoints.med}px)`]: {
        minWidth: 800,
      },

      '&> a': {
        float: 'left',
      },

      '.nav-toggle': {
        float: 'right',
        display: 'none',
        fontSize: '22px',
        color: '#e8e8e8',
        cursor: 'pointer',
        [`@media only screen and (max-width: ${props.theme.breakpoints.large})px`]: {
          display: 'block',
        },
      },
    },

    '.nav-responsive': {
      float: 'left',
      paddingLeft: 20,
      height: 40,

      '&> a': {
        textDecoration: 'none',
        color: '#eee',
        marginRight: 18,

        '&:last-child': {
          marginRight: 0,
        },

        '&:hover': {
          color: props.theme.colors.white1,
        },
      },

      [`@media only screen and (max-width: ${props.theme.breakpoints.large}px)`]: {
        position: 'fixed',
        top: 50,
        backgroundColor: '#265068',
        borderTop: '1px solid #29566f',
        borderBottom: '1px solid #29566f',
        width: '100%',
        left: 0,
        paddingLeft: 0,
        height: 'auto',
        textAlign: 'center',
      },
    },

    '.subactions': {
      float: 'right',
      [`@media only screen and (max-width: ${props.theme.breakpoints.large}px)`]: {
        marginRight: 10,
      },

      'a:last-child': {
        marginRight: 0,
      },
    },

    '.logo': {
      width: '22px',
      height: '22px',
      verticalAlign: 'middle',
      position: 'relative',
      top: '-1px',
      [`@media only screen and (max-width: ${props.theme.breakpoints.med}px)`]: {
        marginLeft: 10,
      },
    },

    '.user_dropdown': {
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
    },

    '.user_dropdown, .organization_dropdown': {
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
    },

    '.organization_dropdown': {
      '.dropdown-toggle.btn-default': {
        backgroundColor: props.theme.colors.shade2,
        borderRadius: 5,
        borderTop: `1px solid ${props.theme.colors.shade4}`,
        borderBottom: `1px solid ${props.theme.colors.shade1}`,
        position: 'relative',
        paddingLeft: 50,

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
          textDecoration: 'none',
          backgroundColor: props.theme.colors.shade2,
        },

        '&:focus': {
          backgroundColor: props.theme.colors.shade2,
        },

        '&:hover': {
          textDecoration: 'none',
          backgroundColor: props.theme.colors.shade3,
        },
      },

      'ul.dropdown-menu': {
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
      },
      '.open': {
        '.dropdown-toggle.btn-default': {
          backgroundColor: props.theme.colors.shade1,
          borderBottom: `1px solid ${props.theme.colors.shade5}`,
          borderTop: `1px solid ${props.theme.colors.shade1}`,
        },
      },
    },
  }))
);

class Navigation extends React.Component {
  render() {
    return (
      <OuterNav>
        <div className='main-nav col-9'>
          <a
            href='https://giantswarm.io'
            rel='noopener noreferrer'
            target='_blank'
          >
            <img className='logo' src='/images/giantswarm_icon.svg' />
          </a>
          <div className='nav-responsive'>
            <NavLink activeClassName='active' exact to='/'>
              Clusters
            </NavLink>
            <NavLink activeClassName='active' to='/organizations/'>
              Organizations
            </NavLink>
            {this.props.showAppCatalog && (
              <NavLink activeClassName='active' exact to='/apps/'>
                Apps
              </NavLink>
            )}
            {this.props.user.isAdmin ? (
              <NavLink activeClassName='active' to='/users/'>
                Users
              </NavLink>
            ) : (
              undefined
            )}
            <a
              href='https://docs.giantswarm.io'
              rel='noopener noreferrer'
              target='_blank'
            >
              Documentation <i className='fa fa-open-in-new' />
            </a>
          </div>

          <div className='subactions'>
            <div className='organization_dropdown'>
              {Object.entries(this.props.organizations.items).length === 0 &&
              !this.props.organizations.isFetching ? (
                <DropdownButton
                  id='org_dropdown'
                  key='2'
                  title={
                    <span>
                      <span className='label label-default'>ORG</span>No
                      organizations
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
            </div>
            &nbsp; &nbsp;
            <div className='user_dropdown'>
              <DropdownButton
                id='user_dropdown'
                key='1'
                pullRight={true}
                ref={d => {
                  this.user_dropdown = d;
                }}
                title={
                  <div className='user_dropdown--toggle'>
                    <Gravatar
                      default='mm'
                      email={this.props.user.email}
                      size={100}
                    />
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
            </div>
          </div>
        </div>

        <div className='breadcrumb-wrapper'>
          <div className='main col-9'>
            <Breadcrumbs />
          </div>
        </div>
      </OuterNav>
    );
  }
}

Navigation.propTypes = {
  user: PropTypes.object,
  showAppCatalog: PropTypes.bool,
  organizations: PropTypes.object,
  onSelectOrganization: PropTypes.func,
  selectedOrganization: PropTypes.string,
};

export default Navigation;
