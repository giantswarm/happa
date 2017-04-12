'use strict';

import React from 'react';
import {connect} from 'react-redux';

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
      <div className={'new-cluster--worker-setting-row ' + ( this.props.readOnly ? 'readonly' : '' )}>
        <div className="new-cluster--worker-setting-label">
          {this.props.label}
        </div>
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
  unit: React.PropTypes.string,
  label: React.PropTypes.string,
  value: React.PropTypes.number,
  stepSize: React.PropTypes.number,
  formatter: React.PropTypes.func,
  min: React.PropTypes.number,
  max: React.PropTypes.number,
  onChange: React.PropTypes.func,
  readOnly: React.PropTypes.bool
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(NumberPicker);