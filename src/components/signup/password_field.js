"use strict";
var React = require('react');
var ReactDOM = require('react-dom');
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

  focus: function() {
    ReactDOM.findDOMNode(this.refs.input).focus();
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