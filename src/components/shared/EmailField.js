import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

let typingTimer = 0;
const doneTypingInterval = 250; // ms

//
// EmailField
// ---------------------------------------------------------------------
// A subcomponent that emits 'onChange' when the user has stopped typing
// after 250 ms or after leaving the field
//
// And shows a error message if the email is not valid

const validationRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

class EmailField extends React.Component {
  state = {
    valid: false,
    validationError: '',
  };

  componentDidMount() {
    if (this.props.autofocus) {
      this.input.focus();
    }
  }

  onBlur = () => {
    clearTimeout(typingTimer);
    if (this.props.onChange) {
      this.props.onChange(this);
    }
  };

  onChange = () => {
    const currentValue = this.input.value;

    this.setState(
      (prevState) => {
        let valid = false;
        let validationError = prevState.validationError;

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

        return {
          valid: valid,
          validationError: validationError,
        };
      },
      () => {
        if (this.props.onChange) {
          this.props.onChange(this);
        }
      }
    );

    // Check after a few ms afer stopping typing if it is invalid, and then show an error message
    typingTimer = setTimeout(() => {
      if (!validationRegEx.test(currentValue)) {
        this.setState({
          validationError: 'Please enter a valid email address',
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
          onBlur={this.onBlur}
          onChange={this.onChange}
          ref={(i) => {
            this.input = i;
          }}
          type='email'
        />
        <span className='message'>
          {this.state.validationError} {this.props.errorMessage}&nbsp;
        </span>
      </div>
    );
  }
}

EmailField.propTypes = {
  autofocus: PropTypes.bool,
  onChange: PropTypes.func,
  onStartTyping: PropTypes.func,
  name: PropTypes.string,
  label: PropTypes.string,
  errorMessage: PropTypes.object,
};

export default EmailField;
