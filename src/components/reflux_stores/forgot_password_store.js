"use strict";
var Reflux                = require('reflux');
var forgotPasswordActions = require("../reflux_actions/forgot_password_actions");
var flashMessageActions   = require('../reflux_actions/flash_message_actions');
var userActions           = require('../reflux_actions/user_actions');

var form;

module.exports = Reflux.createStore({
  listenables: forgotPasswordActions,

  getInitialState: function() {
    form = {
      submitting: false,
      verifyingToken: false,
      tokenValid: false,
      email: localStorage.getItem('user.email') || "",
      passwordField: {
        valid: false,
        value: ""
      },
      passwordConfirmationField: {
        valid: false,
        value: ""
      },
      statusMessage: "enter_password"
    };

    return form;
  },

  onRequestPasswordRecoveryToken: function() {
    form.submitting = true;
    this.trigger(form);
  },

  onRequestPasswordRecoveryTokenCompleted: function(data) {
    form.submitting = false;
    this.trigger(form);

    // Store the user's email on "successful" token request
    // That way when the user comes back to set their password we can
    // skip the confirmation step where they have to re-enter their email.
    localStorage.setItem('user.email', data.email);

    // Show a success flash.
    // TODO: Transition to a success page.
    flashMessageActions.add({
      message: 'Please check your inbox, an email with a link should be sent.',
      class: "success"
    });
  },

  onRequestPasswordRecoveryTokenFailed: function(error) {
    form.submitting = false;
    this.trigger(form);

    switch(error.name) {
      case "TypeError":
        flashMessageActions.add({
          message: "Please provide a (valid) email address",
          class: "danger"
        });
      break;
      default:
        flashMessageActions.add({
          message: "Something went wrong. Or servers might be down, or perhaps you've made too many requests in a row. Please try again in 5 minutes.",
          class: "danger"
        });
    }
  },

  onUpdateEmail: function(value) {
    form.email = value;
    this.trigger(form);
  },

  onSetNewPassword: function() {
    form.submitting = true;
    this.trigger(form);
  },

  onSetNewPasswordFailed: function() {
    form.submitting = false;
    this.trigger(form);
  },

  onSetNewPasswordCompleted: function(data) {
    form.submitting = false;
    userActions.authenticate.completed({
      authtoken: data.token,
      email: data.email
    });
    this.trigger(form);
  },

  onVerifyPasswordRecoveryToken: function() {
    form.verifyingToken = true;
    this.trigger(form);
  },

  onVerifyPasswordRecoveryTokenFailed: function(error) {
    form.verifyingToken = false;
    form.tokenValid = false;

    switch(error.name) {
      case "TypeError":
        flashMessageActions.add({
          message: "Please provide a (valid) email address",
          class: "danger"
        });
        form.email = "";
        break;
      case "Error":
        flashMessageActions.add({
          message: "The reset token appears to be invalid.",
          class: "danger"
        });
        form.email = "";
        break;
    }

    this.trigger(form);
  },

  onVerifyPasswordRecoveryTokenCompleted: function() {
    form.verifyingToken = false;
    form.tokenValid = true;
    this.trigger(form);
  },

  onPasswordEditingStarted: function() {
    form.passwordField.valid = false;
    this.trigger(form);
  },

  onPasswordEditingCompleted: function(password) {
    form.passwordField.valid = false;

    if (password.length === 0) {
      // Be invalid, but don't change the status message.
    } else if (password.length < 8) {
      form.statusMessage = "password_too_short";
    } else if (/^[0-9]+$/.test(password)) {
      form.statusMessage = "password_not_just_numbers";
    } else if (/^[a-z]+$/.test(password)) {
      form.statusMessage = "password_not_just_letters";
    } else if (/^[A-Z]+$/.test(password)) {
      form.statusMessage = "password_not_just_letters";
    } else {
      form.statusMessage = "password_ok";
      form.passwordField.valid = true;
    }

    form.passwordField.value = password;

    this.trigger(form);
  },

  onPasswordConfirmationEditingStarted: function(confirmation) {
    form.passwordConfirmationField.valid = false;
    this.trigger(form);

    if (form.passwordField.valid) {
      if (form.passwordField.value === confirmation) {
        form.statusMessage = "password_confirmation_ok";
        form.passwordConfirmationField.valid = true;
        this.trigger(form);
      }
    }
  },

  onPasswordConfirmationEditingCompleted: function(confirmation) {
    form.passwordConfirmationField.valid = false;

    if (form.passwordField.valid) {
      if (form.passwordField.value === confirmation) {
        form.statusMessage = "password_confirmation_ok";
        form.passwordConfirmationField.valid = true;
      } else {
        form.statusMessage = "password_confirmation_mismatch";
      }

      this.trigger(form);
    }
  },

  passwordFieldsValid: function() {
    return form.passwordField.valid && form.passwordConfirmationField.valid;
  }
});