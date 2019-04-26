

import PropTypes from 'prop-types';
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
      this.input.focus();
    }
  }

  onBlur = () => {
    clearTimeout(typingTimer);
    this.props.onChange(this.input.value);
  };

  onChange = () => {
    this.props.onStartTyping(this.input.value);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      this.props.onChange(this.input.value);
    }, doneTypingInterval);
  };

  value = () => {
    return this.input.value;
  };

  focus = () => {
    ReactDOM.findDOMNode(this.input).focus();
  };

  blur = () => {
    ReactDOM.findDOMNode(this.input).blur();
  };

  render() {
    return (
      <div className='textfield'>
        <label htmlFor={this.props.name}>{this.props.label}</label>
        <input
          type='password'
          ref={input => {
            this.input = input;
          }}
          id={this.props.name}
          onBlur={this.onBlur}
          onChange={this.onChange}
        />
        <span className='message'>{this.props.validationError}&nbsp;</span>
      </div>
    );
  }
}

PasswordField.propTypes = {
  autofocus: PropTypes.bool,
  onChange: PropTypes.func,
  onStartTyping: PropTypes.func,
  name: PropTypes.string,
  label: PropTypes.string,
  validationError: PropTypes.string,
};

export default PasswordField;
