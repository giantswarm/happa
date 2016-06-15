"use strict";

var React = require('react');
var Reflux  = require('reflux');
var $     = require('jquery');
var Passage = require("../../lib/passage_client");
var passage = new Passage({endpoint: window.config.passageEndpoint});
var actions = require("../reflux_actions/sign_up_form_actions");
var store = require("../reflux_stores/sign_up_form_store");
var PasswordField = require("./password_field");
var StatusMessage = require('./status_message');
var TermsOfService = require('./terms_of_service');

module.exports = React.createClass({
  mixins: [Reflux.connect(store, 'signUpForm'), Reflux.listenerMixin],

  componentDidMount: function(){
    // contactID and token are set via URL
    actions.checkInvite(this.props.params.contactId, this.props.params.token);
    this.listenTo(actions.advanceForm, this.advanceForm);
  },

  componentWillReceiveProps: function(props) {
    console.log(props);
    actions.checkInvite(props.params.contactId, props.params.token);
  },

  advanceForm: function() {
    $("#" + this.state.signUpForm.formSteps[this.state.signUpForm.currentStep]).slideDown();
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
        <p className="subtitle">Your first steps with Giant Swarm are in reach. Please use this form to create your Giant Swarm user account.</p>

        <form ref="signupForm" onSubmit={this.handleSubmit}>
          <div ref="passwordGroup" id="passwordGroup">
            <PasswordField ref="password"
                           label="Password"
                           onStartTyping={actions.passwordEditing.started}
                           onChange={actions.passwordEditing.completed} />

            <PasswordField ref="password"
                           label="Password, once again"
                           onStartTyping={actions.passwordConfirmationEditing.started}
                           onChange={actions.passwordConfirmationEditing.completed} />
          </div>

          <div id="TOSGroup">
            <TermsOfService />

            <div className="checkbox">
              <label for="tosAccept">
                <input type="checkbox" ref="tosAccept" id="tosAccept" onChange={this.tosChanged} />
                I accept the terms of service
              </label>
            </div>
          </div>

          <StatusMessage status={this.state.signUpForm.statusMessage} />

          <div>
            {
              this.state.signUpForm.buttonText[this.state.signUpForm.currentStep] != "" ? <button className="primary" disabled={ (! this.state.signUpForm.advancable) || this.state.signUpForm.submitting }>{this.state.signUpForm.buttonText[this.state.signUpForm.currentStep]}</button> : null
            }
          </div>
        </form>



      </div>
    );
  }
});
