"use strict";
var React = require('react');
var typingTimer;
var doneTypingInterval = 600; // ms

//
// PasswordField
// ---------------------------------------------------------------------
// A subcomponent that emits 'onChange' when the user has stopped typing
// after 500 ms or after leaving the field
//
var PasswordField = React.createClass({
  onBlur: function(e) {
    clearTimeout(typingTimer);
    this.props.onChange(this.refs.input.value);
  },

  onChange: function(e) {
    this.props.onStartTyping();
    clearTimeout(typingTimer);
    typingTimer = setTimeout(x => {
      this.props.onChange(this.refs.input.value);
    }, doneTypingInterval);
  },

  value: function() {
    return this.refs.input.value;
  },

  render: function() {
    return (
      <div className="textfield">
        <label htmlFor={this.props.name}>{this.props.label}</label>
        <input type="password" ref="input" id={this.props.name} onBlur={this.onBlur} onChange={this.onChange} />
      </div>
    );
  }
});

//
// PasswordConfirmationField
// ---------------------------------------------------------------------
// A subcomponent that renders two password fields and emits onChange
// with both values when they change. But only after the second field
// has been touched at least once
//
var PasswordConfirmationField = React.createClass({
  getInitialState: function() {
    return {
      confirmationTouched: false
    };
  },

  passwordChanged: function(value) {
    if (this.state.confirmationTouched) {
      this.props.onChange({
        value: this.refs.password.value(),
        confirmationValue: this.refs.confirmation.value()
      });
    }
  },

  confirmationChanged: function(value) {
    this.setState({confirmationTouched: true});

    this.props.onChange({
      value: this.refs.password.value(),
      confirmationValue: this.refs.confirmation.value()
    });
  },

  render: function() {
    return (
      <div>
        <PasswordField ref="password" onStartTyping={this.props.onStartTyping} label={this.props.label} onChange={this.passwordChanged} />
        <PasswordField ref="confirmation" onStartTyping={this.props.onStartTyping} label={this.props.confirmationLabel} onChange={this.confirmationChanged} />
      </div>
    );
  }
});

module.exports = PasswordConfirmationField;