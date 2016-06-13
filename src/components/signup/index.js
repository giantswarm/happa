"use strict";

var React = require('react');
var $     = require('jquery');

module.exports = React.createClass({

  getInitialState: function() {
    return {validInvite: null};
  },

  componentDidMount: function(){
    // contactID and token are set via URL
    this.checkInvite(this.props.params.contactId, this.props.params.token);
  },

  checkInvite: function(contactId, token) {
    console.log("Checking invite", contactId, token);
    var url = window.config.passageEndpoint + '/invite/'+ contactId +'/' + token;
    $.getJSON(url, function(data){
      this.setState({"validInvite": data.is_valid});
      if (data.is_valid) {
        console.log("Invite is valid!");
        console.log(data);
        this.setState({
          "email": data.email,
          "initialAccountExpirationDays": data.initial_account_expiration
        });
      } else {
        console.log("Sorry, invite is not valid");
      }
    }.bind(this));
  },

  handleSubmit: function(e){
    e.preventDefault();
    console.log("Form submitted!");
    // TODO: check if both passwords are identical
    var account = {
      "contact_id": this.props.params.contactId,
      "invite_token": this.props.params.token,
      "password": this.refs.password1.value
    };
    console.log(account);
    var url = window.config.passageEndpoint + '/accounts/';
    $.ajax({
      type: "POST",
      url: url,
      dataType: 'json',
      contentType : 'application/json',
      data: JSON.stringify(account),
      success: function(responseData){
        console.log("Account generated successfully.", responseData);
      },
      error: function(jqXHR, textStatus, textStatus){
        console.log("An error occurred when trying to create a user account.");
        console.log(jqXHR, textStatus, textStatus);
      }
    });
  },

  render: function() {
    if (this.state.validInvite === true) {
      return (
        <div className="signup--container col-6">
          <p>Hi {this.state.email}! Your account will be valid for {this.state.initialAccountExpirationDays} days starting from your sign-up.</p>
          <form ref="signupForm" onSubmit={this.handleSubmit}>
            <div className="textfield">
              <label for="password1">Password</label>
              <input type="password" ref="password1" id="password1" />
            </div>
            <div className="textfield">
              <label for="password2">Password, once more</label>
              <input type="password" ref="password2" id="password2" />
            </div>
            <div>
              <button>Submit</button>
            </div>
          </form>
        </div>
      );
    } else if (this.state.validInvite === false) {
      return (
        <div className="signup--container col-6">
          Sorry, your invite is not valid
        </div>
      );
    } else {
      return (
        <div className="signup--container col-6">
          Checking your invite...
        </div>
      );
    }
  }
});
