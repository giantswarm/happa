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
    const { name, label, validationError, onStartTyping, ...rest } = this.props;

    return (
      <div className='textfield' {...rest}>
        <label htmlFor={name}>{label}</label>
        <input
          id={name}
          onBlur={this.onBlur}
          onChange={this.onChange}
          ref={input => {
            this.input = input;
          }}
          type='password'
        />
        <span className='message'>{validationError}&nbsp;</span>
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
