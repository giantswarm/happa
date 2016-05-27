"use strict";

var React = require('react');
var {Link, IndexLink}  = require('react-router');

var UserActions = require('./reflux_actions/user_actions');
var UserStore   = require('./reflux_stores/user_store');

module.exports = React.createClass ({
  render: function() {
    return (
      <div className="">
        <nav>
          <IndexLink to="/" activeClassName="active">Home</IndexLink>
          {" | "}
          <Link to="/services/new" activeClassName="active">New Service</Link>
          {" | "}
          <Link to="/logout" activeClassName="active">Logout</Link>
        </nav>
        {this.props.children}
      </div>
    );
  }
});