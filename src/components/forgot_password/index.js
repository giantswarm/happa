"use strict";

var forgotPasswordStore     = require('../reflux_stores/forgot_password_store');
var forgotPasswordActions   = require('../reflux_actions/forgot_password_actions');
var flashMessageActions     = require('../reflux_actions/flash_message_actions');
var FlashMessages           = require('../flash_messages/index.js');
var Reflux                  = require('reflux');
var React                   = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var {Link}                  = require('react-router');

module.exports = React.createClass({
  mixins: [Reflux.connect(forgotPasswordStore, 'form'), Reflux.listenerMixin],

  getInitialState: function() {
    return {
      email: forgotPasswordStore.getInitialState().email
    };
  },

  submit: function(event) {
    event.preventDefault();
    flashMessageActions.clearAll();
    forgotPasswordActions.requestPasswordRecoveryToken(this.state.form.email);
  },

  componentWillUnmount: function() {
    flashMessageActions.clearAll();
  },

  updateEmail(event) {
    flashMessageActions.clearAll();
    forgotPasswordActions.updateEmail(event.target.value);
    this.setState({
      email: event.target.value
    });
  },

  success() {
    return(
      <div className="forgot-password--token-sent">
        <h1><i className="fa fa-envelope"></i> Check your mail!</h1>
        <p>If you have an account, we've sent an email to {this.state.form.email}.</p>

        <small>
        <p>Having trouble? Please contact us via <a href="mailto:support@giantswarm.io">support@giantswarm.io</a></p>
        </small>

        <small>
          <Link to="/login">Back to login form</Link>
        </small>
      </div>
    );
  },

  form() {
    return(
      <div>
        <h1>Forgot your password?</h1>
        <p>Enter the email you used to sign-up and submit the form. We'll send you a link you can use to set a new password.</p>
        <form onSubmit={this.submit}>
          <div className="textfield">
            <label>Email</label>
            <input value={this.state.email}
                   type="email"
                   id="email"
                   ref="email"
                   onChange={this.updateEmail} autoFocus />
          </div>
          <div className="progress_button--container">
            <button type="submit" className="btn primary" disabled={this.state.form.submitting} onClick={this.submit}>
              {
                this.state.form.submitting ? "Submitting ..." : "Submit"
              }
            </button>
            <ReactCSSTransitionGroup transitionName="slide-right" transitionEnterTimeout={200} transitionLeaveTimeout={200}>
            {
              this.state.form.submitting ? <img className="loader" src="/images/loader_oval_light.svg" /> : null
            }
            </ReactCSSTransitionGroup>
          </div>
          <Link to="/login">Back to login form</Link>
        </form>
      </div>
    );
  },

  render: function() {
    return (
      <div>
        <div className="login_form--mask"></div>

        <ReactCSSTransitionGroup transitionName={`login_form--transition`} transitionAppear={true} transitionAppearTimeout={200} transitionEnterTimeout={200} transitionLeaveTimeout={200}>
          <div className="login_form--container col-4">
            <div className="login_form--flash-container">
              <FlashMessages />
            </div>
            { this.state.form.tokenRequested ? this.success() : this.form() }
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});