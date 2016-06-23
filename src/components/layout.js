"use strict";

var React = require('react');
var Reflux = require('reflux');
var {Link, IndexLink}  = require('react-router');

var UserActions = require('./reflux_actions/user_actions');
var UserStore   = require('./reflux_stores/user_store');
var FlashMessages = require('./flash_messages/index');

//<Link to="/services/new" activeClassName="active">New Service</Link>

module.exports = React.createClass ({
  mixins: [Reflux.connect(UserStore,'user'), Reflux.listenerMixin],

  render: function() {
    return (
      <div>
        <nav>
          <div className="col-8">
            <a href="https://giantswarm.io" target="_blank"><img className="logo" src="/images/giantswarm_icon.svg" /></a>
            <IndexLink to="/" activeClassName="active">Home</IndexLink>
            <div className="subactions">
              { UserStore.currentUser().authenticated ? <span className="currentuser">Logged in as: {UserStore.currentUser().email}</span> : null }
              { UserStore.currentUser().authenticated ? <Link to="/logout" activeClassName="active">Logout</Link> : null }
            </div>
          </div>
        </nav>

        <div className="main col-8">
          <FlashMessages />
          {this.props.children}
        </div>
      </div>
    );
  }
});