import PropTypes from 'prop-types';
import React from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import { css } from 'styled-components';
import styled from 'styled-components';
import ValidationErrorMessage from 'UI/Inputs/ValidationErrorMessage';
import { mergeActionNames } from 'utils/realUserMonitoringUtils';

// NumberPicker is a component that allows a user to pick a number by
// incrementing / decrementing a value or typing it straight into the input
// field.
//
// It only allows whole numbers.
//
// State explanation:
//
// inputValue - The current value of the input field. This might not be a valid
//              number since users should be able to clear the input before they
//              type in a new value.
//
// value - The derived value of the number picker. This will always be a valid
//         number and will be set to 0 if the the input value is invalid.
//
// valid - A boolean that represents whether or not the inputvalue is valid.
//
// validationError - A string that explains why the inputValue is not valid.
//
//
// Why do we need both inputValue and value?
// Because when a user wants to type a number, he has to first clear the
// current value. Say a user wants to type 30, but the input currently has the
// value 1 in it. Then for a moment the input has an empty string in it,
// which would break various things (like increment / decrement) if we were to
// use the inputs value as the true value for this number picker at all times.
//
// Lifecycle:
//
// This component contains an normal html input field. When this input field
// changes, its value is validated. Afterwards the parent component is
// notified of the change through the passed in onChange callback function.
// The onChange function recieves an object with the value and validity of
// the number picker:
//
// {
//   value: 13,
//   valid: true
// }

const Label = styled.div`
  display: inline-block;
  width: 150px;
`;

const ValueSpan = styled.span`
  input {
    display: inline-block;
    background-color: inherit;
    border: none;
    text-align: center;
    width: 100%;
    height: 100%;
    outline: none;
    font-size: 16px;
  }
  input:focus {
    outline: none;
  }
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    --webkit-appearance: none;
    margin: 0;
  }
`;

const Wrapper = styled.div`
  display: inline-block;
  margin-top: 4px;
  margin-bottom: 10px;

  /* to hide the increment/decrement buttons when disabled */
  input:disabled {
    appearance: textfield;
  }
`;

const Control = styled.div`
  width: 160px;
  display: inline-block;
  height: 35px;
  background-color: #32526a;
  line-height: 35px;
  text-align: center;
  border-radius: 5px;
  position: relative;
  margin-bottom: 5px;
`;

const IncrementDecrementButtonCSS = css`
  position: absolute;
  display: inline-block;
  top: 0px;
  width: 35px;
  background-color: #3b5f7b;
  cursor: pointer;
  user-select: none;
  &:hover {
    background-color: #486d8a;
  }
  &:active {
    background-color: #3b5f7b;
    color: #aaa;
  }
  &.disabled,
  &.disabled:hover,
  &.disabled:active {
    background-color: #567;
    color: #eee;
  }
`;

const IncrementButton = styled.div`
  ${IncrementDecrementButtonCSS};
  right: 0px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
`;

const DecrementButton = styled.div`
  ${IncrementDecrementButtonCSS};
  left: 0px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
`;

class NumberPicker extends React.Component {
  state = {
    inputValue: this.props.value,
    value: this.props.value,
    valid: true,
    validationError: '',
  };

  componentDidUpdate(prevProps) {
    if (prevProps.max !== this.props.max || prevProps.min !== this.props.min) {
      const { value, validationError } = this.validateInput(this.state.value);
      const isValid = validationError.length < 1;
      this.updateValue(value, isValid, validationError);
    }
  }

  increment = () => {
    const currentValue = this.props.value;
    const desiredValue = currentValue + this.props.stepSize;

    this.updateInput(desiredValue);
  };

  decrement = () => {
    const currentValue = this.props.value;
    const desiredValue = currentValue - this.props.stepSize;

    this.updateInput(desiredValue);
  };

  updateInput = (desiredValue, allowInvalidValues = false) => {
    // Validate.
    // eslint-disable-next-line prefer-const
    let { value, validationError } = this.validateInput(desiredValue);

    // Ensure values are never above max or below min. They can be null.
    const { max, min } = this.props;
    switch (true) {
      case value === null:
        value = '';
        break;
      case !allowInvalidValues && value < min:
        value = min;
        break;
      case !allowInvalidValues && value > max:
        value = max;
        break;
    }

    const isValid = validationError.length < 1 || (min <= 0 && value === 0);

    this.updateValue(value, isValid, validationError);
  };

  updateValue(newValue, isValid = false, validationError = '') {
    this.setState(
      {
        inputValue: newValue,
        value: newValue,
        valid: isValid,
        validationError,
      },
      () => {
        // Notify Parent.
        if (this.props.onChange) {
          this.props.onChange({
            value: this.state.value,
            valid: this.state.valid,
          });
        }
      }
    );
  }

  validateInput = (desiredValue) => {
    if (desiredValue === '') {
      return {
        value: null,
        validationError: 'Field must not be empty',
      };
    } else if (desiredValue > this.props.max) {
      return {
        value: parseInt(desiredValue),
        validationError: `Value must not be larger than ${this.props.max}`,
      };
    } else if (desiredValue < this.props.min) {
      return {
        value: parseInt(desiredValue),
        validationError: `Value must not be smaller than ${this.props.min}`,
      };
    } else if (!isWholeNumber(parseFloat(desiredValue))) {
      return {
        value: parseInt(desiredValue),
        validationError: 'Value must be a whole number',
      };
    }

    return {
      value: parseInt(desiredValue),
      validationError: '',
    };
  };

  handleFocus = (event) => {
    event.target.select();
  };

  render() {
    return (
      <Wrapper
        className={`${this.props.className ?? ''} ${this.props.theme ?? ''} ${
          this.props.readOnly ? 'readonly ' : ''
        }`}
      >
        {this.props.label ? <Label>{this.props.label}</Label> : undefined}

        <Control>
          {this.props.readOnly ? undefined : (
            <RUMActionTarget
              name={mergeActionNames(
                RUMActions.DecrementNumber,
                this.props.eventNameSuffix
              )}
            >
              <DecrementButton
                className={
                  this.state.inputValue === this.props.min && 'disabled'
                }
                onClick={this.decrement}
                aria-label='Decrement'
                role='button'
              >
                &ndash;
              </DecrementButton>
            </RUMActionTarget>
          )}
          <ValueSpan>
            <input
              disabled={this.props.readOnly}
              onChange={(e) => this.updateInput(e.target.value, true)}
              onFocus={this.handleFocus}
              step={this.props.stepSize}
              type='number'
              value={
                this.props.readOnly ? this.props.value : this.state.inputValue
              }
              title={this.props.title}
            />
          </ValueSpan>
          {this.props.readOnly ? undefined : (
            <RUMActionTarget
              name={mergeActionNames(
                RUMActions.IncrementNumber,
                this.props.eventNameSuffix
              )}
            >
              <IncrementButton
                className={this.props.value === this.props.max && 'disabled'}
                onClick={this.increment}
                aria-label='Increment'
                role='button'
              >
                +
              </IncrementButton>
            </RUMActionTarget>
          )}
        </Control>
        <ValidationErrorMessage message={this.state.validationError} />
      </Wrapper>
    );
  }
}

NumberPicker.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  stepSize: PropTypes.number,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  theme: PropTypes.string,
  className: PropTypes.string,
  title: PropTypes.string,
  /** This string is appended to the user action event names recorded in Real User Monitoring. Should be UPPERCASE. */
  eventNameSuffix: PropTypes.string,
};

function isWholeNumber(value) {
  if (typeof value === 'number' && value % 1 === 0) {
    return true;
  }

  return false;
}

export default NumberPicker;
