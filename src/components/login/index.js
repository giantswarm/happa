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
    this.listenTo(actions.authenticate.completed, this.onAuthenticateCompleted);
  },

  onAuthenticateCompleted: function() {
    // Login was a success, should transition
    // if (nextPath) {
      // this.context.router.replaceWith(nextPath);
    // } else {
    this.context.router.push('/services/new');
    // }
  },

  updateUsername(event) {
    actions.updateUsername(event.target.value);
  },

  updatePassword(event) {
    actions.updatePassword(event.target.value);
  },

  logIn(e) {
    e.preventDefault();
    actions.authenticate(this.state.user.username, this.state.user.password);
  },

  //TODO: turn progressbutton into a component
  render: function() {
    return (
      <div>
        <div className="login_form--mask"></div>

        <ReactCSSTransitionGroup transitionName={`login_form--transition`} transitionAppear={true} transitionAppearTimeout={200} transitionEnterTimeout={200} transitionLeaveTimeout={200}>
          <div className="login_form--container col-4">
            <h1>Giant Swarm</h1>
            <form onSubmit={this.logIn}>
              <div className="textfield">
                <label>Username or Email</label>
                <input value={this.state.user.username}
                       type="text"
                       id="usernameOrEmail"
                       ref="usernameOrEmail"
                       onChange={this.updateUsername} autoFocus />
              </div>

              <div className="textfield">
                <label>Password</label>
                <input value={this.state.user.password}
                       type="password"
                       id="password"
                       ref="password"
                       onChange={this.updatePassword} />
              </div>

              <div className="progress_button--container">
                <button type="submit" className="btn primary" disabled={this.state.user.authenticating} onClick={this.logIn}>
                  {
                    this.state.user.authenticating ? "Logging in ..." : "Log in"
                  }
                </button>
                <ReactCSSTransitionGroup transitionName="slide-right" transitionEnterTimeout={200} transitionLeaveTimeout={200}>
                {
                  this.state.user.authenticating ? <img className="loader" src="/images/loader_oval_light.svg" /> : null
                }
                </ReactCSSTransitionGroup>
              </div>
            </form>
            <div className="login_form--legal">
            By logging in you acknowledge that we track your activities in order to analyze your product usage and improve your experience. See our <a href="https://giantswarm.io/privacypolicy/">Privacy Policy</a>.
            <br/>
            <br/>
            Trouble logging in? Please contact us via <a href="mailto:support@giantswarm.io">support@giantswarm.io</a>
            </div>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});