'use strict';

import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class NumberPicker extends React.Component {
  state = { inputValue: this.props.value };

  formatValue() {
    if (this.props.formatter) {
      return this.props.formatter(this.props.value);
    } else {
      return [this.props.value, this.props.unit].join(' ');
    }
  }

  triggerOnChange = newValue => {
    if (this.props.onChange) {
      this.props.onChange(newValue);
      this.setState({
        inputValue: newValue,
      });
    }
  };

  increment = () => {
    var currentValue = this.props.value;
    var desiredValue = currentValue + this.props.stepSize;

    if (currentValue < this.props.max) {
      this.triggerOnChange(Math.min(this.props.max, desiredValue));
    }
  };

  decrement = () => {
    var currentValue = this.props.value;
    var desiredValue = currentValue - this.props.stepSize;

    if (currentValue > this.props.min) {
      this.triggerOnChange(Math.max(this.props.min, desiredValue));
    }
  };

  updateInput = e => {
    this.setState({
      inputValue: e.target.value,
    });
  };

  validateInput = () => {
    var desiredValue = this.state.inputValue;

    if (desiredValue === '') {
      // If the user left the input empty, return it to the original value.
      this.triggerOnChange(this.props.value);
    } else if (desiredValue > this.props.max) {
      // If the user typed in something greater than the max, set it to the max.
      this.triggerOnChange(this.props.max);
    } else if (desiredValue < this.props.min) {
      // If the user typed in something smaller than the min, set it to the min.
      this.triggerOnChange(this.props.min);
    } else {
      // Finally, if the user typed in a reasonable value, use it.
      this.triggerOnChange(parseInt(desiredValue));
    }
  };

  render() {
    return (
      <div
        className={`number-picker ${this.props.theme ? this.props.theme : ''} ${
          this.props.readOnly ? 'readonly ' : ''
        }`}
      >
        {this.props.label ? (
          <div className='number-picker--label'>{this.props.label}</div>
        ) : (
          undefined
        )}

        <div className='number-picker--control'>
          {this.props.readOnly ? (
            undefined
          ) : (
            <div
              className='number-picker--control-decrease'
              onClick={this.decrement}
            >
              &ndash;
            </div>
          )}
          <span className='number-picker--value'>
            <input
              type='number'
              disabled={this.props.readOnly}
              min={this.props.min}
              max={this.props.max}
              value={this.state.inputValue}
              onChange={this.updateInput}
              onBlur={this.validateInput}
            />
          </span>
          {this.props.readOnly ? (
            undefined
          ) : (
            <div
              className='number-picker--control-increase'
              onClick={this.increment}
            >
              +
            </div>
          )}
        </div>
      </div>
    );
  }
}

NumberPicker.propTypes = {
  unit: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.number,
  stepSize: PropTypes.number,
  formatter: PropTypes.func,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NumberPicker);
