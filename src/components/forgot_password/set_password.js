"use strict";

var forgotPasswordStore     = require('../reflux_stores/forgot_password_store');
var forgotPasswordActions   = require('../reflux_actions/forgot_password_actions');
var flashMessageActions     = require('../reflux_actions/flash_message_actions');
var FlashMessages           = require('../flash_messages/index.js');
var Reflux                  = require('reflux');
var React                   = require('react');
var ReactCSSTransitionGroup = require('react-addons-css-transition-group');
var {Link}                  = require('react-router');
var PasswordField           = require("../signup/password_field");

module.exports = React.createClass({
  mixins: [Reflux.connect(forgotPasswordStore, 'form'), Reflux.listenerMixin],

  submit: function() {

  },

  updateEmail(event) {
    flashMessageActions.clearAll();

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
            <form onSubmit={this.submit}>
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
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});