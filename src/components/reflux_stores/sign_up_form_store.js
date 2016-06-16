"use strict";
var Reflux   = require('reflux');
var actions  = require("../reflux_actions/sign_up_form_actions");
var userActions  = require("../reflux_actions/user_actions");
var _        = require('underscore');
var $        = require('jquery');
var React    = require('react');
var validate = require('validate.js');

function newSignUpForm() {
  return {
    statusMessage: "verify_started",
    checkInviteStatus: 'started',
    email: undefined,
    passwordField: {value: "", valid: false},
    passwordConfirmationField: {value: "", valid: false},
    termsOfServiceField: {value: false, valid: false},
    formValid: undefined,
    submitting: false,
    buttonText: ["", "Next", "Submit"],
    formSteps: ["", 'passwordGroup', 'TOSGroup'],
    currentStep: 0,
    advancable: false
  };
}

var signUpForm;

module.exports = Reflux.createStore({
  listenables: actions,

  getInitialState: function() {
    signUpForm = newSignUpForm();
    return signUpForm;
  },

  onResetForm: function() {
    signUpForm = newSignUpForm();
    this.trigger(signUpForm);
  },

  onCheckInvite: function() {
    signUpForm.checkInviteStatus = 'started';
    signUpForm.statusMessage = "verify_started";
    this.trigger(signUpForm);
  },

  onCheckInviteCompleted: function(data) {
    signUpForm.email = data.email;
    signUpForm.statusMessage = "verify_completed";
    signUpForm.checkInviteStatus = 'completed';
    this.trigger(signUpForm);

    setTimeout(function() {
      signUpForm.statusMessage = "enter_password";
      this.trigger(signUpForm);
      actions.advanceForm();
    }.bind(this), 800);
  },

  onAdvanceForm: function(data) {
    if (signUpForm.currentStep < signUpForm.formSteps.length) {
      signUpForm.currentStep += 1;
    }

    if (signUpForm.currentStep === 2) {
      signUpForm.statusMessage = "tos_intro";
    }

    this.trigger(signUpForm);

    this.validateForm();
  },

  onCheckInviteFailed: function(error) {
    signUpForm.checkInviteStatus = "failed";

    if (error === "Bad request") {
      signUpForm.statusMessage = "verify_failed";
    } else if (error === "InvalidTokenOrContactID") {
      signUpForm.statusMessage = "invalid_token";
    }

    this.trigger(signUpForm);
  },

  onCreateAccount: function() {
    signUpForm.statusMessage = "create_account_starting";
    signUpForm.submitting = true;
    this.trigger(signUpForm);
  },

  onCreateAccountCompleted: function(data) {
    console.log(data);
    signUpForm.statusMessage = "create_account_completed";
    userActions.authenticate.completed({
      email: data.email,
      authtoken: data.token
    });
    this.trigger(signUpForm);
  },

  onCreateAccountFailed: function() {
    signUpForm.statusMessage = "create_account_failed";
    signUpForm.submitting = false;
    this.trigger(signUpForm);
  },

  onPasswordEditingStarted: function() {
    signUpForm.formValid = false;
    signUpForm.advancable = false;
    signUpForm.passwordField.valid = false;
    this.trigger(signUpForm);
  },

  onPasswordEditingCompleted: function(password) {
    signUpForm.passwordField.valid = false;

    if (password.length < 8) {
      signUpForm.statusMessage = "password_too_short";
    } else if (/^[0-9]+$/.test(password)) {
      signUpForm.statusMessage = "password_not_just_numbers";
    } else if (/^[a-z]+$/.test(password)) {
      signUpForm.statusMessage = "password_not_just_letters";
    } else if (/^[A-Z]+$/.test(password)) {
      signUpForm.statusMessage = "password_not_just_letters";
    } else {
      signUpForm.statusMessage = "password_ok";
      signUpForm.passwordField.valid = true;
    }

    signUpForm.passwordField.value = password;

    this.trigger(signUpForm);

    this.validateForm();
  },

  onPasswordConfirmationEditingStarted: function(confirmation) {
    signUpForm.formValid = false;
    signUpForm.advancable = false;
    signUpForm.passwordConfirmationField.valid = false;
    this.trigger(signUpForm);
  },

  onPasswordConfirmationEditingCompleted: function(confirmation) {
    signUpForm.passwordConfirmationField.valid = false;

    if (signUpForm.passwordField.valid) {
      if (signUpForm.passwordField.value === confirmation) {
        signUpForm.statusMessage = "password_confirmation_ok";
        signUpForm.passwordConfirmationField.valid = true;
      } else {
        signUpForm.statusMessage = "password_confirmation_mismatch";
      }

      this.trigger(signUpForm);

      this.validateForm();
    }
  },

  onTosChanged: function(checked) {
    signUpForm.formValid = false;
    signUpForm.advancable = false;

    if (checked) {
      signUpForm.termsOfServiceField.valid = true;
      signUpForm.termsOfServiceField.value = true;
      signUpForm.statusMessage = "tos_ok";
    } else {
      signUpForm.termsOfServiceField.valid = false;
      signUpForm.termsOfServiceField.value = false;
      signUpForm.statusMessage = "tos_not_accepted";
    }

    this.trigger(signUpForm);

    this.validateForm();
  },

  validateForm: function() {
    if (signUpForm.currentStep === 1 && signUpForm.passwordField.valid && signUpForm.passwordConfirmationField.valid) {
      signUpForm.advancable = true;
    } else if (signUpForm.currentStep === 2 && signUpForm.passwordField.valid && signUpForm.passwordConfirmationField.valid && signUpForm.termsOfServiceField.valid) {
      signUpForm.advancable = true;
    } else {
      signUpForm.advancable = false;
    }

    if (signUpForm.passwordField.valid && signUpForm.passwordConfirmationField.valid && signUpForm.termsOfServiceField.valid) {
      signUpForm.formValid = true;
      signUpForm.statusMessage = "all_good";
    } else {
      signUpForm.formValid = false;
    }

    this.trigger(signUpForm);
  }

});