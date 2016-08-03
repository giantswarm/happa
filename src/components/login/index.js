"use strict";

var actions                 = require('../../actions/user_actions');
var store                   = require('../../stores/user_store');
var flashMessageActions     = require('../../actions/flash_message_actions');
var FlashMessages           = require('../flash_messages/index.js');
var Reflux                  = require('reflux');
var React                   = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var {Link}                  = require('react-router');

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  mixins: [Reflux.connect(store,'user'), Reflux.listenerMixin],

  componentDidMount: function() {
    this.listenTo(actions.authenticate.completed, this.onAuthenticateCompleted);
    this.listenTo(actions.authenticate.failed, this.onAuthenticateFailed);
  },

  componentWillUnmount: function() {
    flashMessageActions.clearAll();
  },

  onAuthenticateCompleted: function() {
    flashMessageActions.clearAll();
    this.context.router.push('/');
    flashMessageActions.add({
      message: 'Signed in succesfully.',
      class: "success"
    });
  },

  onAuthenticateFailed: function(message) {
    flashMessageActions.add({
      message: message,
      class: "danger"
    });
  },

  updateEmail(event) {
    flashMessageActions.clearAll();
    actions.updateEmail(event.target.value);
  },

  updatePassword(event) {
    flashMessageActions.clearAll();
    actions.updatePassword(event.target.value);
  },

  logIn(e) {
    e.preventDefault();

    flashMessageActions.clearAll();

    if ( ! this.state.user.email) {
      flashMessageActions.add({
        message: 'Please provide the email address that you used for registration.',
        class: "danger"
      });
    } else if ( ! this.state.user.password) {
      flashMessageActions.add({
        message: 'Please enter your password.',
        class: "danger"
      });
    }

    if (this.state.user.email && this.state.user.password) {
      actions.authenticate(this.state.user.email, this.state.user.password);
    }
  },

  //TODO: turn progressbutton into a component
  render: function() {
    return (
      <div>
        <div className="login_form--mask"></div>

        <ReactCSSTransitionGroup transitionName={`login_form--transition`} transitionAppear={true} transitionAppearTimeout={200} transitionEnterTimeout={200} transitionLeaveTimeout={200}>
          <div className="login_form--container col-4">
            <div className="login_form--flash-container">
              <FlashMessages />
            </div>

            <h1>Log in to Giant&nbsp;Swarm</h1>
            <form onSubmit={this.logIn}>
              <div className="textfield">
                <label>Email</label>
                <input value={this.state.user.email}
                       type="text"
                       id="email"
                       ref="email"
                       onChange={this.updateEmail} autoFocus />
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
              <Link to="/forgot_password">Forgot your password?</Link>
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