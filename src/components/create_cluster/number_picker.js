'use strict';

import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

class NumberPicker extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  formatValue() {
    if (this.props.formatter) {
      return this.props.formatter(this.props.value);
    } else {
      return [this.props.value, this.props.unit].join(' ');
    }
  }

  triggerOnChange = (newValue) => {
    if(this.props.onChange) {
      this.props.onChange(newValue);
    }
  }

  increment = () => {
    var currentValue = this.props.value;
    var desiredValue = (currentValue + this.props.stepSize);

    if (currentValue < this.props.max) {
      this.triggerOnChange(Math.min(this.props.max, desiredValue));
    }
  }

  decrement = () => {
    var currentValue = this.props.value;
    var desiredValue = (currentValue - this.props.stepSize);

    if (currentValue > this.props.min) {
      this.triggerOnChange(Math.max(this.props.min, desiredValue));
    }
  }

  render() {
    return (
      <div className={'new-cluster--worker-setting-row ' + ( this.props.readOnly ? 'readonly ' : ' ' ) + ( this.props.theme)}>
        {
          this.props.label ?
          <div className="new-cluster--worker-setting-label">
            {this.props.label}
          </div>
          :
          undefined
        }

        <div className="new-cluster--worker-setting-control">
          {
            this.props.readOnly ?
            undefined
            :
            <div className="new-cluster--worker-setting-control-decrease" onClick={this.decrement} >
              &ndash;
            </div>
          }
          {this.formatValue()}
          {
            this.props.readOnly ?
            undefined
            :
            <div className="new-cluster--worker-setting-control-increase" onClick={this.increment}>
              +
            </div>
          }
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
  theme: PropTypes.string
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(NumberPicker);
