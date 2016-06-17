"use strict";

var React = require('react');
var {Link, IndexLink}  = require('react-router');

var UserActions = require('./reflux_actions/user_actions');
var UserStore   = require('./reflux_stores/user_store');

//<Link to="/services/new" activeClassName="active">New Service</Link>

module.exports = React.createClass ({
  render: function() {
    return (
      <div>
        <nav>
          <div className="col-8">
            <img className="logo" src="/images/giantswarm_icon.svg" />
            <IndexLink to="/" activeClassName="active">Home</IndexLink>
            <div className="subactions">
              <span className="currentuser">Logged in as: {UserStore.currentUser().email}</span>
              <Link to="/logout" activeClassName="active">Logout</Link>
            </div>
          </div>
        </nav>
        {this.props.children}
      </div>
    );
  }
});