import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';

const doneTypingInterval = 250; // ms

//
// PasswordField
// ---------------------------------------------------------------------
// A subcomponent that emits 'onChange' when the user has stopped typing
// after 500 ms or after leaving the field
//
class PasswordField extends React.Component {
  state = {
    value: '',
  };

  typingTimer = 0;

  componentDidMount() {
    if (this.props.autoFocus) {
      this.input.focus();
    }
  }

  onBlur = () => {
    clearTimeout(this.typingTimer);
    this.props.onChange(this.state.value);
  };

  onChange = e => {
    this.setState({ value: e.target.value });

    this.props.onStartTyping(this.state.value);
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.props.onChange(this.state.value);
    }, doneTypingInterval);
  };

  value = () => {
    return this.state.value;
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
    const {
      name,
      label,
      validationError,
      onStartTyping,
      onChange,
      ...rest
    } = this.props;

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
  autoFocus: PropTypes.bool,
  onChange: PropTypes.func,
  onStartTyping: PropTypes.func,
  name: PropTypes.string,
  label: PropTypes.string,
  validationError: PropTypes.string,
};

export default PasswordField;
