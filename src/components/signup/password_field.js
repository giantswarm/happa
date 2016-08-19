"use strict";
import React from 'react';
import ReactDOM from 'react-dom';
var typingTimer;
var doneTypingInterval = 250; // ms

//
// PasswordField
// ---------------------------------------------------------------------
// A subcomponent that emits 'onChange' when the user has stopped typing
// after 500 ms or after leaving the field
//
var PasswordField = React.createClass({
  componentDidMount: function() {
    if (this.props.autofocus) {
      this.refs.input.focus();
    }
  },

  onBlur: function(e) {
    clearTimeout(typingTimer);
    this.props.onChange(this.refs.input.value);
  },

  onChange: function(e) {
    this.props.onStartTyping(this.refs.input.value);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(x => {
      this.props.onChange(this.refs.input.value);
    }, doneTypingInterval);
  },

  value: function() {
    return this.refs.input.value;
  },

  focus: function() {
    ReactDOM.findDOMNode(this.refs.input).focus();
  },

  blur: function() {
    ReactDOM.findDOMNode(this.refs.input).blur();
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

module.exports = PasswordField;