"use strict";

import React from 'react';
import Reflux from 'reflux';
import Passage from "../../lib/passage_client";
import actions from "../../actions/sign_up_form_actions";
import store from "../../stores/sign_up_form_store";
import PasswordField from "./password_field";
import StatusMessage from './status_message';
import TermsOfService from './terms_of_service';

var passage = new Passage({endpoint: window.config.passageEndpoint});

module.exports = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },

  mixins: [Reflux.connect(store, 'signUpForm'), Reflux.listenerMixin],

  componentDidMount: function(){
    // contactID and token are set via URL
    actions.checkInvite(this.props.params.contactId, this.props.params.token);
    this.listenTo(actions.advanceForm, this.advanceForm);
    this.listenTo(actions.createAccount.completed, this.accountCreated);
  },

  componentWillReceiveProps: function(props) {
    actions.resetForm();
    actions.checkInvite(props.params.contactId, props.params.token);
  },

  advanceForm: function() {
    if (this.state.signUpForm.currentStep === 1) {
      this.refs.password.focus();
    } else if (this.state.signUpForm.currentStep === 2) {
      this.refs.passwordConfirmation.focus();
    } else if (this.state.signUpForm.currentStep === 3) {
      this.refs.passwordConfirmation.blur();
    }
    actions.advanceForm.completed();
  },

  accountCreated: function() {
    // Delay a bit so the user sees the DONE message
    // and then transition to the getting started guide

    flashMessageActions.add({
      message: 'Account created! Welcome to Giant Swarm.',
      class: "success"
    });

    setTimeout(() => {
      this.context.router.push('/');
    }, 1000);
  },

  handleSubmit: function(e){
    e.preventDefault();

    if(this.state.signUpForm.formValid) {
      actions.createAccount({
        contactId: this.props.params.contactId,
        inviteToken: this.props.params.token,
        password: this.state.signUpForm.passwordField.value
      });
    } else {
      actions.advanceForm();
    }
  },

  tosChanged: function(e) {
    actions.tosChanged(e.target.checked);
  },

  render: function() {
    return (
      <div className="signup--container col-6">
        <h1>Create Your Giant Swarm Account</h1>


        <form ref="signupForm" onSubmit={this.handleSubmit} className={"step-" + this.state.signUpForm.currentStep} >
          <div id="passwordGroup">
            <p className="subtitle">This is your personal Giant Swarm account for the email address {this.state.signUpForm.email}!</p>

            <PasswordField ref="password"
                           label="Set a password"
                           onStartTyping={actions.passwordEditing.started}
                           onChange={actions.passwordEditing.completed} />
          </div>

          <div id="passwordConfirmationGroup">
            <PasswordField ref="passwordConfirmation"
                           label="Password, once again"
                           onStartTyping={actions.passwordConfirmationEditing.started}
                           onChange={actions.passwordConfirmationEditing.completed} />
          </div>

          <div id="TOSGroup">
            <TermsOfService />

            <div className="checkbox">
              <label htmlFor="tosAccept">
                <input type="checkbox" ref="tosAccept" id="tosAccept" onChange={this.tosChanged} />
                I accept the terms of service
              </label>
            </div>
          </div>

          <StatusMessage status={this.state.signUpForm.statusMessage} />

          <div className="signup--submitButton">
            {
              this.state.signUpForm.buttonText[this.state.signUpForm.currentStep] !== "" ? <button className="primary" disabled={ (! this.state.signUpForm.advancable) || this.state.signUpForm.submitting }>{this.state.signUpForm.buttonText[this.state.signUpForm.currentStep]}</button> : null
            }

            { this.state.signUpForm.submitting ? <img className="loader" src="/images/loader_oval_light.svg" /> : null }
          </div>
        </form>



      </div>
    );
  }
});
