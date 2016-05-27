"use strict";

var actions = require('../reflux_actions/user_actions');
var store   = require('../reflux_stores/user_store');
var Reflux  = require('reflux');
var React   = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  mixins: [Reflux.connect(store,'user'), Reflux.listenerMixin],

  componentDidMount: function() {
    this.listenTo(actions.logout.completed, this.onLogoutCompleted);
    actions.logout();
  },

  onLogoutCompleted: function() {
    this.context.router.push('/login');
  },

  //TODO: turn progressbutton into a component
  render: function() {
    return (
      <div>
        <ReactCSSTransitionGroup transitionName="logout--mask--transition" transitionAppear={true} transitionAppearTimeout={400} transitionEnterTimeout={200} transitionLeaveTimeout={200}>
          <div className="logout--mask"></div>
        </ReactCSSTransitionGroup>
        <div className="logout--container">
          <span>Loging out</span>
          <img className="loader" src="/images/loader_oval_light.svg" />
        </div>
      </div>
    );
  }
});