import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import ValidationErrorMessage from 'UI/ValidationErrorMessage';

let typingTimer = 0;
const doneTypingInterval = 250; // ms

//
// InputField
// ---------------------------------------------------------------------
// A subcomponent that emits 'onChange' when the user has stopped typing
// after 250 ms or after leaving the field
//
// And shows an error message if a supplied validation function returns fails

class InputField extends React.Component {
  state = {
    valid: false,
    validationError: '',
    value: null,
  };

  componentDidMount() {
    this.setState({ value: this.props.value });
    if (this.props.autofocus) {
      this.input.focus();
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.value) {
      const validation = props.validate(props.value);

      return {
        value: props.value,
        valid: validation.valid,
        validationError: validation.validationError,
      };
    }

    return null;
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.value !== this.props.value;
  }

  onBlur = () => {
    clearTimeout(typingTimer);
    if (this.props.onChange) {
      this.props.onChange(this.value());
    }
  };

  onChange = () => {
    const currentValue = this.input.value;

    this.setState(
      (prevState, prevProps) => {
        const validation = prevProps.validate(currentValue);
        let valid = false;
        let validationError = prevState.validationError;

        if (prevProps.onStartTyping) {
          prevProps.onStartTyping(currentValue);
        }

        clearTimeout(typingTimer);

        // If its valid, show that immediately to the user. Thats nice for them
        // to get instant feedback.
        if (validation.valid) {
          valid = true;
          validationError = '';
        }

        return {
          valid: valid,
          validationError: validationError,
          value: currentValue,
        };
      },
      () => {
        if (this.props.onChange) {
          this.props.onChange(currentValue);
        }
      }
    );

    // Check after a few ms afer stopping typing if it is invalid, and then show an error message
    typingTimer = setTimeout(() => {
      const validationOutput = this.props.validate(currentValue);
      if (!validationOutput.valid) {
        this.setState({
          validationError: validationOutput.validationError,
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
    // eslint-disable-next-line react/no-find-dom-node
    ReactDOM.findDOMNode(this.input).focus();
  };

  blur = () => {
    // eslint-disable-next-line react/no-find-dom-node
    ReactDOM.findDOMNode(this.input).blur();
  };

  render() {
    return (
      <div className='textfield'>
        <label htmlFor={this.props.name}>{this.props.label}</label>
        <input
          id={this.props.name}
          disabled={this.props.disabled}
          onBlur={this.onBlur}
          onChange={this.onChange}
          readOnly={this.props.readOnly}
          ref={i => {
            this.input = i;
          }}
          type={this.props.type}
          value={this.state.value}
        />
        {// If it is readOnly, don't show validation errors

        this.props.readOnly ? null : (
          <ValidationErrorMessage message={this.state.validationError} />
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
  disabled: PropTypes.bool,
  type: PropTypes.string,
};

export default InputField;
