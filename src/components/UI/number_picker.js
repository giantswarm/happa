import { connect } from 'react-redux';
import { css } from '@emotion/core';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

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
  margin-bottom: 4px;

  /* to hide the increment/decrement buttons when disabled */
  input:disabled {
    appearance: textfield;
  }

  &:hover {
    background-color: darken(#3b5f7b, 2%);
  }

  &:active {
    background-color: darken(#3b5f7b, 6%);
    color: #aaa;
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

const ValidationError = styled.span`
  color: #fcc;
`;

const IncrementDecrementButtonCSS = css`
  position: absolute;
  display: inline-block;
  top: 0px;
  width: 35px;
  background-color: #3b5f7b;
  cursor: pointer;
  user-select: none;
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

    if (currentValue < this.props.max) {
      this.updateInput({
        target: { value: Math.min(this.props.max, desiredValue) },
      });
    }
  };

  decrement = () => {
    var currentValue = this.props.value;
    var desiredValue = currentValue - this.props.stepSize;

    if (currentValue > this.props.min) {
      this.updateInput({
        target: { value: Math.max(this.props.min, desiredValue) },
      });
    }
  };

  updateInput = e => {
    var desiredValue = e.target.value;

    // Validate.
    var { value, valid, validationError } = this.validateInput(desiredValue);

    // Update state.
    this.setState(
      {
        inputValue: desiredValue,
        value: value,
        valid: valid,
        validationError: validationError,
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
        value: 0,
        valid: false,
        validationError: 'Field must not be empty.',
      };
    } else if (desiredValue > this.props.max) {
      return {
        value: parseInt(desiredValue),
        valid: false,
        validationError:
          'Value must not be larger than ' + this.props.max + '.',
      };
    } else if (desiredValue < this.props.min) {
      return {
        value: parseInt(desiredValue),
        valid: false,
        validationError:
          'Value must not be smaller than ' + this.props.min + '.',
      };
    } else if (!isWholeNumber(parseFloat(desiredValue))) {
      return {
        value: parseInt(desiredValue),
        valid: false,
        validationError: 'Value must be a whole number',
      };
    } else {
      return {
        value: parseInt(desiredValue),
        valid: true,
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
            <DecrementButton onClick={this.decrement}>&ndash;</DecrementButton>
          )}
          <ValueSpan>
            <input
              disabled={this.props.readOnly}
              max={this.props.max}
              min={this.props.min}
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
            <IncrementButton onClick={this.increment}>+</IncrementButton>
          )}
        </Control>
        <ValidationError>{this.state.validationError}</ValidationError>
      </Wrapper>
    );
  }
}

NumberPicker.propTypes = {
  unit: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.number,
  stepSize: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
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
