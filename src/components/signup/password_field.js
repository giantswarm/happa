'use strict';
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
class PasswordField extends React.Component {
  componentDidMount() {
    if (this.props.autofocus) {
      this.refs.input.focus();
    }
  }

  onBlur = () => {
    clearTimeout(typingTimer);
    this.props.onChange(this.refs.input.value);
  }

  onChange = () => {
    this.props.onStartTyping(this.refs.input.value);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      this.props.onChange(this.refs.input.value);
    }, doneTypingInterval);
  }

  value = () => {
    return this.refs.input.value;
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
        <input type='password' ref='input' id={this.props.name} onBlur={this.onBlur} onChange={this.onChange} />
        <span className="message">{this.props.validationError}&nbsp;</span>
      </div>
    );
  }
}

PasswordField.propTypes = {
  autofocus: React.PropTypes.bool,
  onChange: React.PropTypes.func,
  onStartTyping: React.PropTypes.func,
  name: React.PropTypes.string,
  label: React.PropTypes.string,
  validationError: React.PropTypes.string
};

export default PasswordField;