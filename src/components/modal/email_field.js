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

class EmailField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      valid: false,
      validationError: ''
    };
  }

  componentDidMount() {
    if (this.props.autofocus) {
      this.refs.input.focus();
    }
  }

  onBlur = () => {
    clearTimeout(typingTimer);
    if (this.props.onChange) {
      this.props.onChange(this);
    }
  }

  onChange = () => {
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
    typingTimer = setTimeout(() => {
      if (! validationRegEx.test(currentValue)) {
        this.setState({
          validationError: 'Please enter a valid email address'
        });
      }
    }, doneTypingInterval);
  }

  value = () => {
    return this.refs.input.value;
  }

  valid = () => {
    return this.state.valid;
  }

  focus = () => {
    ReactDOM.findDOMNode(this.refs.input).focus();
  }

  blur = () => {
    ReactDOM.findDOMNode(this.refs.input).blur();
  }

  render() {
    return (
      <div className='textfield'>
        <label htmlFor={this.props.name}>{this.props.label}</label>
        <input type='email' ref='input' id={this.props.name} onBlur={this.onBlur} onChange={this.onChange} />
        <span className="message">{this.state.validationError} {this.props.errorMessage}&nbsp;</span>
      </div>
    );
  }
}

EmailField.propTypes = {
  autofocus: React.PropTypes.bool,
  onChange: React.PropTypes.func,
  onStartTyping: React.PropTypes.func,
  name: React.PropTypes.string,
  label: React.PropTypes.string,
  errorMessage: React.PropTypes.object
};

export default EmailField;
