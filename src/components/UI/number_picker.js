import { connect } from 'react-redux';
import { css } from '@emotion/core';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import ValidationErrorMessage from 'UI/ValidationErrorMessage';

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
  }
  input:focus {
    outline: none;
  }
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    -webkit-appearance: none;
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

  increment = () => {
    var currentValue = this.props.value;
    var desiredValue = currentValue + this.props.stepSize;

    this.updateInput({
      target: { value: desiredValue },
    });
  };

  decrement = () => {
    const currentValue = this.props.value;
    const desiredValue = currentValue - this.props.stepSize;

    this.updateInput({
      target: { value: desiredValue },
    });
  };

  updateInput = e => {
    const desiredValue = e.target.value;

    // Validate.
    let { value, validationError } = this.validateInput(desiredValue);

    // Ensure values are never above max or below min. They can be null.
    const { max, min } = this.props;
    value = value === null ? '' : value < min ? min : value > max ? max : value;

    // Update state.
    this.setState(
      {
        inputValue: value,
        value,
        valid: value ? true : false,
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
  };

  validateInput = desiredValue => {
    if (desiredValue === '') {
      return {
        value: null,
        validationError: 'Field must not be empty',
      };
    } else if (desiredValue > this.props.max) {
      return {
        value: parseInt(desiredValue),
        validationError: 'Value must not be larger than ' + this.props.max,
      };
    } else if (desiredValue < this.props.min) {
      return {
        value: parseInt(desiredValue),
        validationError: 'Value must not be smaller than ' + this.props.min,
      };
    } else if (!isWholeNumber(parseFloat(desiredValue))) {
      return {
        value: parseInt(desiredValue),
        validationError: 'Value must be a whole number',
      };
    } else {
      return {
        value: parseInt(desiredValue),
        validationError: '',
      };
    }
  };

  handleFocus = event => {
    event.target.select();
  };

  render() {
    return (
      <Wrapper
        className={`${this.props.theme ? this.props.theme : ''} ${
          this.props.readOnly ? 'readonly ' : ''
        }`}
      >
        {this.props.label ? <Label>{this.props.label}</Label> : undefined}

        <Control>
          {this.props.readOnly ? (
            undefined
          ) : (
            <DecrementButton
              className={this.state.inputValue === this.props.min && 'disabled'}
              onClick={this.decrement}
            >
              &ndash;
            </DecrementButton>
          )}
          <ValueSpan>
            <input
              disabled={this.props.readOnly}
              // max={this.props.max}
              // min={this.props.min}
              onChange={this.updateInput}
              onFocus={this.handleFocus}
              step={this.props.stepSize}
              type='number'
              value={
                this.props.readOnly ? this.props.value : this.state.inputValue
              }
            />
          </ValueSpan>
          {this.props.readOnly ? (
            undefined
          ) : (
            <IncrementButton
              className={this.props.value === this.props.max && 'disabled'}
              onClick={this.increment}
            >
              +
            </IncrementButton>
          )}
        </Control>
        <ValidationErrorMessage message={this.state.validationError} />
      </Wrapper>
    );
  }
}

NumberPicker.propTypes = {
  unit: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  stepSize: PropTypes.number,
  min: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  theme: PropTypes.string,
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps() {
  return {};
}

function isWholeNumber(value) {
  if (typeof value === 'number' && value % 1 === 0) {
    return true;
  } else {
    return false;
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NumberPicker);
