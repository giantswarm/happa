'use strict';

import React from 'react';
import {connect} from 'react-redux';

class NumberPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.initialValue
    };
  }

  componentDidMount() {

  }

  formatValue() {
    if (this.props.formatter) {
      return this.props.formatter(this.state.value);
    } else {
      return [this.state.value, this.props.unit].join(' ');
    }
  }

  increment = () => {
    var currentValue = this.state.value;
    var desiredValue = (currentValue + this.props.stepSize);

    if (currentValue < this.props.max) {
      this.setState({
        value: Math.min(this.props.max, desiredValue)
      });
    }
  }

  decrement = () => {
    var currentValue = this.state.value;
    var desiredValue = (currentValue - this.props.stepSize);

    if (currentValue > this.props.min) {
      this.setState({
        value: Math.max(this.props.min, desiredValue)
      });
    }
  }

  render() {
    return (
      <div className="new-cluster--worker-setting-row">
        <div className="new-cluster--worker-setting-label">
          {this.props.label}
        </div>
        <div className="new-cluster--worker-setting-control">
          <div className="new-cluster--worker-setting-control-decrease" onClick={this.decrement} >
            -
          </div>
          {this.formatValue()}
          <div className="new-cluster--worker-setting-control-increase" onClick={this.increment}>
            +
          </div>
        </div>
      </div>
    );
  }
}

NumberPicker.propTypes = {
  unit: React.PropTypes.string,
  label: React.PropTypes.string,
  initialValue: React.PropTypes.number,
  stepSize: React.PropTypes.number,
  formatter: React.PropTypes.func,
  min: React.PropTypes.number,
  max: React.PropTypes.number
};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(NumberPicker);