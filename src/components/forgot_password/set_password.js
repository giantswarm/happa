"use strict";

var forgotPasswordStore     = require('../reflux_stores/forgot_password_store');
var forgotPasswordActions   = require('../reflux_actions/forgot_password_actions');
var userActions             = require('../reflux_actions/user_actions');
var flashMessageActions     = require('../reflux_actions/flash_message_actions');
var FlashMessages           = require('../flash_messages/index.js');
var Reflux                  = require('reflux');
var React                   = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var {Link}                  = require('react-router');
var PasswordField           = require("../signup/password_field");
var StatusMessage           = require('../signup/status_message');

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  mixins: [Reflux.connect(forgotPasswordStore, 'form'), Reflux.listenerMixin],

  getInitialState: function() {
    return {
      password: "",
      passwordConfirmation: "",
      email: forgotPasswordStore.getInitialState().email
    };
  },


  componentDidMount: function(){
    // If we have the email, verify the token immediately.
    if (this.state.form.email) {
      forgotPasswordActions.verifyPasswordRecoveryToken(this.state.form.email, this.props.params.token);
    }

    this.listenTo(userActions.authenticate.completed, this.onAuthenticateCompleted);
  },

  onAuthenticateCompleted: function() {
    flashMessageActions.clearAll();
    this.context.router.push('/');
    flashMessageActions.add({
      message: 'Password set successfully! Welcome back!',
      class: "success"
    });
  },

  submit: function(event) {
    event.preventDefault();
    forgotPasswordActions.setNewPassword(this.state.form.email, this.props.params.token, this.state.form.passwordField.value);
  },

  setEmail: function(event) {
    event.preventDefault();
    flashMessageActions.clearAll();
    forgotPasswordActions.updateEmail(this.state.email);
    forgotPasswordActions.verifyPasswordRecoveryToken(this.state.email, this.props.params.token);
  },

  updateEmail(event) {
    flashMessageActions.clearAll();

    this.setState({
      email: event.target.value
    });
  },

  setPasswordForm() {
    if (this.state.form.tokenValid) {
      return(
        <form onSubmit={this.submit}>
          <StatusMessage status={this.state.form.statusMessage} />

          <div className="textfield">
            <PasswordField ref="password"
                           label="New password"
                           onStartTyping={forgotPasswordActions.passwordEditing.started}
                           onChange={forgotPasswordActions.passwordEditing.completed} />
          </div>

          <div className="textfield">
            <PasswordField ref="passwordConfirmation"
                           label="Password, once again"
                           onStartTyping={forgotPasswordActions.passwordConfirmationEditing.started}
                           onChange={forgotPasswordActions.passwordConfirmationEditing.completed} />
          </div>
          <div className="progress_button--container">
            <button type="submit" className="btn primary" disabled={this.state.form.submitting || ! forgotPasswordStore.passwordFieldsValid()} onClick={this.submit}>
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
      );
    } else {
      if (this.state.form.verifyingToken) {
        return(
          <div className="forgot-password--token-validating">
            <img className="loader" src="/images/loader_oval_light.svg" />
            <br/>
            Validating your token...
          </div>
        );
      } else {
        return(
          <div className="forgot-password--token-validating">
            Something went wrong.
          </div>
        );
      }
    }
  },

  setEmailForm() {
    return(
      <form onSubmit={this.setEmail}>
        <p>Before we can check your recovery token, please type in your e-mail again for verification purposes.</p>
        <div className="textfield">
          <label>E-mail</label>
          <input value={this.state.email}
                 type="text"
                 id="email"
                 ref="email"
                 onChange={this.updateEmail} autoFocus />
        </div>

        <div className="progress_button--container">
          <button type="submit" className="btn primary" disabled={this.state.form.submitting} onClick={this.setEmail}>
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
        <Link to="/login">Back to login form</Link><br/>
        <Link to="/forgot_password">Request a new token</Link>
      </form>
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
            <h1>Set your new password</h1>
            {this.state.form.email ? this.setPasswordForm() : this.setEmailForm()}
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});