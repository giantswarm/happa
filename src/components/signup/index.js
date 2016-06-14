"use strict";

var React = require('react');
var Reflux  = require('reflux');
var $     = require('jquery');
var Passage = require("../../lib/passage_client");
var passage = new Passage({endpoint: window.config.passageEndpoint});
var actions = require("../reflux_actions/sign_up_form_actions");
var store = require("../reflux_stores/sign_up_form_store");
var PasswordConfirmationField = require("./password_confirmation_field");
var StatusMessage = require('./status_message');
var TermsOfService = require('./terms_of_service');

module.exports = React.createClass({
  mixins: [Reflux.connect(store, 'signUpForm'), Reflux.listenerMixin],

  getInitialState: function() {
    return {
      password: "",
      passwordConfirmation: ""
    };
  },

  componentDidMount: function(){
    // contactID and token are set via URL
    actions.checkInvite(this.props.params.contactId, this.props.params.token);
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
      console.log("The form isn't valid yet. This shouldn't even be possible.");
    }
  },

  passwordEditing: function(values) {
    actions.passwordEditing.started();
  },

  passwordEdited: function(values) {
    actions.passwordEditing.completed(values);
  },

  tosChanged: function(e) {
    actions.tosChanged(e.target.checked);
  },

  render: function() {
    return (
      <div className="signup--container col-6">
        <StatusMessage status={this.state.signUpForm.statusMessage} />

        <h1>Create Your Giant Swarm Account</h1>
        <p>Your first steps with Giant Swarm are in reach. Please use this form to create your Giant Swarm user account.</p>

        <form ref="signupForm" onSubmit={this.handleSubmit}>
          <PasswordConfirmationField name="password"
                         label="Password"
                         confirmationLabel="Password, once more"
                         onChange={this.passwordEdited}
                         onStartTyping={this.passwordEditing} />

          <TermsOfService />

          <div className="checkbox">
            <label for="tosAccept">
              <input type="checkbox" ref="tosAccept" id="tosAccept" onChange={this.tosChanged} />
              I accept the terms of service
            </label>
          </div>

          <div>
            <button disabled={ (! this.state.signUpForm.formValid) || this.state.signUpForm.submitting }>Submit</button>
          </div>
        </form>


      </div>
    );
  }
});
