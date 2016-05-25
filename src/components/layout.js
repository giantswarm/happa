"use strict";

var React = require('react');
var {Link, IndexLink}  = require('react-router');

module.exports = React.createClass ({
  render: function() {
    return (
      <div className="">
        <nav>
          <IndexLink to="/" activeClassName="active">Home</IndexLink>
          {" | "}
          <Link to="/services/new" activeClassName="active">New Service</Link>
        </nav>
        {this.props.children}
      </div>
    );
  }
});