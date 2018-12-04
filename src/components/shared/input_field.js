'use strict';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
var typingTimer;
var doneTypingInterval = 250; // ms

//
// InputField
// ---------------------------------------------------------------------
// A subcomponent that emits 'onChange' when the user has stopped typing
// after 250 ms or after leaving the field
//
// And shows a error message if a supplied validation function returns fails

class InputField extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      valid: false,
      validationError: '',
      value: props.value,
    };
  }

  UNSAFE_componentWillReceiveProps(props) {
    if (props.value != this.state.value) {
      var validation = this.props.validate(props.value);
      this.setState({
        value: props.value,
        valid: validation.valid,
        validationError: validation.validationError,
      });
    }
  }

  componentDidMount() {
    if (this.props.autofocus) {
      this.input.focus();
    }
  }

  onBlur = () => {
    clearTimeout(typingTimer);
    if (this.props.onChange) {
      this.props.onChange(this.value());
    }
  };

  onChange = () => {
    var currentValue = this.input.value;
    var validation = this.props.validate(currentValue);
    var valid = false;
    var validationError = this.state.validationError;

    if (this.props.onStartTyping) {
      this.props.onStartTyping(currentValue);
    }

    clearTimeout(typingTimer);

    // If its valid, show that immediately to the user. Thats nice for them
    // to get instant feedback.
    if (validation.valid) {
      valid = true;
      validationError = '';
    }

    this.setState(
      {
        valid: valid,
        validationError: validationError,
        value: currentValue,
      },
      () => {
        if (this.props.onChange) {
          this.props.onChange(currentValue);
        }
      }
    );

    // Check after a few ms afer stopping typing if it is invalid, and then show an error message
    typingTimer = setTimeout(() => {
      var validation = this.props.validate(currentValue);
      if (!validation.valid) {
        this.setState({
          validationError: validation.validationError,
        });
      }
    }, doneTypingInterval);
  };

  value = () => {
    return this.input.value;
  };

  valid = () => {
    return this.state.valid;
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
          ref={i => {
            this.input = i;
          }}
          id={this.props.name}
          value={this.state.value}
          onBlur={this.onBlur}
          onChange={this.onChange}
          readOnly={this.props.readOnly}
        />
        {// If it is readOnly, don't show validation errors

        this.props.readOnly ? null : (
          <span className='message'>{this.state.validationError}</span>
        )}
      </div>
    );
  }
}

InputField.propTypes = {
  autofocus: PropTypes.bool,
  onChange: PropTypes.func,
  onStartTyping: PropTypes.func,
  validate: PropTypes.func,
  name: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string,
  readOnly: PropTypes.bool,
};

export default InputField;
