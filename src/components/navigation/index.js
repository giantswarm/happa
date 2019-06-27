import { Breadcrumbs } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { organizationSelect } from '../../actions/organizationActions';
import _ from 'underscore';
import DropdownButton from 'react-bootstrap/lib/DropdownButton';
import Gravatar from 'react-gravatar';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import PropTypes from 'prop-types';
import React from 'react';

class Navigation extends React.Component {
  selectOrganization = orgId => {
    this.props.dispatch(organizationSelect(orgId));
  };

  render() {
    return (
      <nav className='outer-nav'>
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
                        onSelect={this.selectOrganization}
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
      </nav>
    );
  }
}

Navigation.propTypes = {
  user: PropTypes.object,
  showAppCatalog: PropTypes.bool,
  organizations: PropTypes.object,
  selectedOrganization: PropTypes.string,
  dispatch: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(
  () => {
    return {};
  },
  mapDispatchToProps
)(Navigation);
