"use strict";

import userActions from '../../actions/user_actions';
import FlashMessages from '../flash_messages/index.js';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Link} from 'react-router';
import PasswordField from "../signup/password_field";
import StatusMessage from '../signup/status_message';
import {flashAdd, flashClearAll} from '../../actions/flashMessageActions';
import {connect} from 'react-redux';
import Button from '../button';
import * as forgotPasswordActions from '../../actions/forgotPasswordActions';
import {bindActionCreators} from 'redux';

var SetPassword = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  getInitialState: function() {
    return {
      password: "",
      passwordConfirmation: "",
      email: localStorage.getItem('user.email') || "",
      submitting: false,

      passwordField: {
        valid: false,
        value: ""
      },

      passwordConfirmationField: {
        valid: false,
        value: ""
      },

      formIsValid: false,

      verifyingToken: false,
      tokenValid: false,
      statusMessage: "enter_password"
    };
  },


  componentDidMount: function(){
    // If we have the email, verify the token immediately.
    if (this.state.email) {
      this.setState({
        verifyingToken: true
      });

      this.props.actions.verifyPasswordRecoveryToken(this.state.email, this.props.params.token)
      .then((m) => {
        this.setState({
          verifyingToken: false,
          tokenValid: true
        });
      })
      .catch((error) => {
        switch(error.name) {
          case "TypeError":
            this.props.dispatch(flashAdd({
              message: "Please provide a (valid) email address",
              class: "danger"
            }));

            break;
          case "Error":
            this.props.dispatch(flashAdd({
              message: "The reset token appears to be invalid.",
              class: "danger"
            }));

            break;
        }

        this.setState({
          verifyingToken: false,
          tokenValid: false
        });
      });
    }
  },

  submit: function(event) {
    event.preventDefault();

    this.setState({
      submitting: true
    });

    this.props.actions.setNewPassword(this.state.email, this.props.params.token, this.state.passwordField.value)
    .then(() => {
      this.setState({
        submitting: false
      });

      this.props.dispatch(flashClearAll());
      this.context.router.push('/');
      this.props.dispatch(flashAdd({
        message: 'Password set successfully! Welcome back!',
        class: "success"
      }));
    });

  },

  setEmail: function(event) {
    event.preventDefault();
    this.props.dispatch(flashClearAll());
    forgotPasswordActions.updateEmail(this.state.email);
    forgotPasswordActions.verifyPasswordRecoveryToken(this.state.email, this.props.params.token);
  },

  updateEmail(event) {
    this.props.dispatch(flashClearAll());

    this.setState({
      email: event.target.value
    });
  },

  passwordEditingStarted: function(password) {
    this.setState({
      passwordField: {
        valid: false,
        value: password
      }
    });
  },

  passwordEditingCompleted: function(password) {
    var valid = false;
    var statusMessage = this.state.statusMessage;

    if (password.length === 0) {
      // Be invalid, but don't change the status message.
    } else if (password.length < 8) {
      statusMessage = "password_too_short";
    } else if (/^[0-9]+$/.test(password)) {
      statusMessage = "password_not_just_numbers";
    } else if (/^[a-z]+$/.test(password)) {
      statusMessage = "password_not_just_letters";
    } else if (/^[A-Z]+$/.test(password)) {
      statusMessage = "password_not_just_letters";
    } else {
      statusMessage = "password_ok";
      valid = true;
    }

    this.setState({
      statusMessage: statusMessage,

      passwordField: {
        valid: valid,
        value: password
      }
    });
  },

  passwordConfirmationEditingStarted: function(confirmation) {
    var valid = false;
    var statusMessage = this.state.statusMessage;

    if (this.state.passwordField.valid) {
      if (this.state.passwordField.value === confirmation) {
        statusMessage = "password_confirmation_ok";
        valid = true;
      }
    }

    this.setState({
      statusMessage: statusMessage,

      passwordConfirmationField: {
        valid: valid,
        value: confirmation
      }
    });
  },

  passwordConfirmationEditingCompleted: function(confirmation) {
    var valid = false;
    var statusMessage = this.state.statusMessage;

    if (this.state.passwordField.valid) {
      if (this.state.passwordField.value === confirmation) {
        statusMessage = "password_confirmation_ok";
        valid = true;
      } else {
        statusMessage = "password_confirmation_mismatch";
      }
    }

    this.setState({
      statusMessage: statusMessage,

      passwordConfirmationField: {
        valid: valid,
        value: confirmation
      }
    });
  },

  formIsValid() {
    return this.state.passwordField.valid && this.state.passwordConfirmationField.valid;
  },

  setPasswordForm() {
    if (this.state.tokenValid) {
      return(
        <form onSubmit={this.submit}>
          <StatusMessage status={this.state.statusMessage} />

          <div className="textfield">
            <PasswordField ref="password"
                           label="New password"
                           onStartTyping={this.passwordEditingStarted}
                           onChange={this.passwordEditingCompleted}
                           autofocus />
          </div>

          <div className="textfield">
            <PasswordField ref="passwordConfirmation"
                           label="Password, once again"
                           onStartTyping={this.passwordConfirmationEditingStarted}
                           onChange={this.passwordConfirmationEditingCompleted} />
          </div>
          <div className="progress_button--container">
            <button type="submit" className="btn primary" disabled={this.state.submitting || ! this.formIsValid()} onClick={this.submit}>
              {
                this.state.submitting ? "Submitting ..." : "Submit"
              }
            </button>
            <ReactCSSTransitionGroup transitionName="slide-right" transitionEnterTimeout={200} transitionLeaveTimeout={200}>
            {
              this.state.submitting ? <img className="loader" src="/images/loader_oval_light.svg" /> : null
            }
            </ReactCSSTransitionGroup>
          </div>
          <Link to="/login">Back to login form</Link>
        </form>
      );
    } else {
      if (this.state.verifyingToken) {
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
        <p>Before we can check your recovery token, please type in your email again for verification purposes.</p>
        <div className="textfield">
          <label>Email</label>
          <input value={this.state.email}
                 type="email"
                 id="email"
                 ref="email"
                 onChange={this.updateEmail} autoFocus />
        </div>

        <div className="progress_button--container">
          <button type="submit" className="btn primary" disabled={this.state.submitting} onClick={this.setEmail}>
            {
              this.state.submitting ? "Submitting ..." : "Submit"
            }
          </button>
          <ReactCSSTransitionGroup transitionName="slide-right" transitionEnterTimeout={200} transitionLeaveTimeout={200}>
          {
            this.state.submitting ? <img className="loader" src="/images/loader_oval_light.svg" /> : null
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
            {this.state.email ? this.setPasswordForm() : this.setEmailForm()}
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
});


function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(forgotPasswordActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(null, mapDispatchToProps)(SetPassword);