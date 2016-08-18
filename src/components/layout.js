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

var Layout = React.createClass ({
  mixins: [Reflux.connect(UserStore,'user'), Reflux.listenerMixin],

  render: function() {
    return (
      <div>
        <nav>
          <div className="col-8">
            <a href="https://giantswarm.io" target="_blank"><img className="logo" src="/images/giantswarm_icon.svg" /></a>
            <IndexLink to="/" activeClassName="active">Home</IndexLink>

            <div className="subactions">
              <DropdownButton title={<span><span className="label label-default">ORG</span> giantswarm</span>} key="2" id="org_dropdown">
                <MenuItem componentClass={Link} href="/organizations/giantswarm" to="/organizations/giantswarm">Details for giantswarm</MenuItem>
                <MenuItem divider />
                <MenuItem componentClass={Link} href="/organizations" to="/organizations">Manage organizations</MenuItem>
                <MenuItem divider />
                <MenuItem header>Switch Organization</MenuItem>
                {

                  _.map(_.sortBy(this.props.organizations.items, 'id'), (org) => {
                    return <MenuItem key={org.id}>{org.id}</MenuItem>;
                  })
                }
              </DropdownButton>
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
    organizations: state.entities.organizations
  };
}

module.exports = connect(mapStateToProps)(Layout);