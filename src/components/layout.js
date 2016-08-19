"use strict";

var React = require('react');
var Reflux = require('reflux');
var {Link, IndexLink}  = require('react-router');

var UserActions = require('../actions/user_actions');
var UserStore   = require('../stores/user_store');
var FlashMessages = require('./flash_messages/index');

import Modal from './modal/index';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import {connect} from 'react-redux';
import _ from 'underscore';
import {organizationSelect, organizationsLoad} from '../actions/organizationActions';
var Layout = React.createClass ({
  mixins: [Reflux.connect(UserStore,'user'), Reflux.listenerMixin],

  componentDidMount() {
    this.props.dispatch(organizationsLoad());
  },

  selectOrganization: function(orgId) {
    this.props.dispatch(organizationSelect(orgId));
  },

  render: function() {
    return (
      <div>
        <nav>
          <div className="col-8">
            <a href="https://giantswarm.io" target="_blank"><img className="logo" src="/images/giantswarm_icon.svg" /></a>
            <IndexLink to="/" activeClassName="active">Home</IndexLink>

            <div className="subactions">
              {
                _.map(this.props.organizations.items, (x) => {return x.id}).length === 0 ?
                <DropdownButton title={<span><span className="label label-default">ORG</span> No organizations</span>} key="2" id="org_dropdown">
                  <MenuItem componentClass={Link} href="/organizations" to="/organizations">Manage organizations</MenuItem>
                </DropdownButton>
                :
                <DropdownButton title={<span><span className="label label-default">ORG</span> {this.props.selectedOrganization}</span>} key="2" id="org_dropdown">
                  <MenuItem componentClass={Link} href="/organizations/giantswarm" to={"/organizations/" + this.props.selectedOrganization}>Details for {this.props.selectedOrganization}</MenuItem>
                  <MenuItem divider />
                  <MenuItem componentClass={Link} href="/organizations" to="/organizations">Manage organizations</MenuItem>
                  <MenuItem divider />
                  <MenuItem header>Switch Organization</MenuItem>
                  {

                    _.map(_.sortBy(this.props.organizations.items, 'id'), (org) => {
                      return <MenuItem onSelect={this.selectOrganization} eventKey={org.id} key={org.id}>{org.id}</MenuItem>;
                    })
                  }
                </DropdownButton>
              }
              &nbsp;
              &nbsp;
              <DropdownButton title={<span><span className="label label-default">USER</span> {UserStore.currentUser().email}</span>} key="1" id="user_dropdown">
                <MenuItem componentClass={Link} href="/account_settings" to="/account_settings">Account Settings</MenuItem>
                <MenuItem componentClass={Link} href="/logout" to="/logout">Logout</MenuItem>
              </DropdownButton>
            </div>
          </div>
        </nav>

        <div className="main col-8">
          <FlashMessages />
          <Modal />
          {this.props.children}
        </div>
      </div>
    );
  }
});

function mapStateToProps(state, ownProps) {
  return {
    organizations: state.entities.organizations,
    selectedOrganization: state.app.selectedOrganization
  };
}

module.exports = connect(mapStateToProps)(Layout);