'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
var typingTimer;
var doneTypingInterval = 250; // ms

//
// EmailField
// ---------------------------------------------------------------------
// A subcomponent that emits 'onChange' when the user has stopped typing
// after 250 ms or after leaving the field
//
// And shows a error message if the email is not valid


var validationRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var EmailField = React.createClass({
  getInitialState: function() {
    return {
      valid: false,
      validationError: ''
    };
  },

  componentDidMount: function() {
    if (this.props.autofocus) {
      this.refs.input.focus();
    }
  },

  onBlur: function(e) {
    clearTimeout(typingTimer);
    if (this.props.onChange) {
      this.props.onChange(this);
    }
  },

  onChange: function(e) {
    var currentValue = this.refs.input.value;
    var valid = false;
    var validationError = this.state.validationError;

    if (this.props.onStartTyping) {
      this.props.onStartTyping(currentValue);
    }

    clearTimeout(typingTimer);

    // If its valid, show that immediately to the user. Thats nice for them
    // to get instant feedback.
    if (validationRegEx.test(currentValue)) {
      valid = true;
      validationError = '';
    }

    this.setState({
      valid: valid,
      validationError: validationError
    }, () => {
      if (this.props.onChange) {
        this.props.onChange(this);
      }
    });

    // Check after a few ms afer stopping typing if it is invalid, and then show an error message
    typingTimer = setTimeout(x => {
      if (! validationRegEx.test(currentValue)) {
        this.setState({
          validationError: 'Please enter a valid email address'
        });
      }
    }, doneTypingInterval);
  },

  value: function() {
    return this.refs.input.value;
  },

  valid: function() {
    return this.state.valid;
  },

  focus: function() {
    ReactDOM.findDOMNode(this.refs.input).focus();
  },

  blur: function() {
    ReactDOM.findDOMNode(this.refs.input).blur();
  },

  render: function() {
    return (
      <div className='textfield'>
        <label htmlFor={this.props.name}>{this.props.label}</label>
        <input type='email' ref='input' id={this.props.name} onBlur={this.onBlur} onChange={this.onChange} />
        <span className="message">{this.state.validationError}&nbsp;</span>
      </div>
    );
  }
});

module.exports = EmailField;