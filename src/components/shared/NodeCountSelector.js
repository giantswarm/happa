import NumberPicker from 'UI/NumberPicker';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const DEFAULT_VALUE_CONSTRAINTS = {
  min: 1,
  max: 999,
  stepSize: 1,
};

const SpanWrapper = styled.span`
  display: block;
  margin-bottom: 10px;
`;

/**
 * NodeCountSelector is a component that allows a user to pick a number of
 * nodes by incrementing / decrementing a node count value or adjusting min and
 * max values for scaling limits.
 */
class NodeCountSelector extends React.Component {
  handleFormSubmit = e => {
    e.preventDefault();
  };

  updateValue(valuesToAdd) {
    const nextScalingValue = Object.assign({}, this.props.scaling, valuesToAdd);

    this.props.onChange({
      scaling: nextScalingValue,
    });
  }

  updateScalingMin = numberPicker => {
    this.updateValue({ min: numberPicker.value, minValid: numberPicker.valid });
  };

  updateScalingMax = numberPicker => {
    this.updateValue({
      max: numberPicker.value,
      maxValid: numberPicker.valid,
    });
  };

  updateNodeCount = numberPicker => {
    this.updateValue({
      min: numberPicker.value,
      minValid: numberPicker.valid,
      max: numberPicker.value,
      maxValid: numberPicker.valid,
    });
  };

  handleFocus = event => {
    event.target.select();
  };

  render() {
    const { label, readOnly, maxValue, minValue, scaling } = this.props;

    if (this.props.autoscalingEnabled === true) {
      return (
        <form onSubmit={this.handleFormSubmit}>
          <div className='row'>
            <div className='col-6'>
              <label data-testid='node-count-selector-picker'>
                <SpanWrapper>
                  {label && label.min ? label.min : 'Minimum'}
                </SpanWrapper>
                <NumberPicker
                  label=''
                  max={scaling.max}
                  min={minValue}
                  onChange={this.updateScalingMin}
                  readOnly={readOnly}
                  stepSize={DEFAULT_VALUE_CONSTRAINTS.stepSize}
                  value={scaling.min}
                />
              </label>
            </div>
            <div className='col-6'>
              <label data-testid='node-count-selector-picker'>
                <SpanWrapper>
                  {label && label.max ? label.max : 'Maximum'}
                </SpanWrapper>
                <NumberPicker
                  label=''
                  max={maxValue}
                  min={scaling.min}
                  onChange={this.updateScalingMax}
                  readOnly={readOnly}
                  stepSize={DEFAULT_VALUE_CONSTRAINTS.stepSize}
                  value={scaling.max}
                />
              </label>
            </div>
          </div>
          <div className='row'>
            <div className='col-12'>
              <p data-testid='node-count-selector-autoscaling-label'>
                {scaling.min === scaling.max
                  ? 'To enable autoscaling, set minimum and maximum to different values.'
                  : 'To disable autoscaling, set both numbers to the same value.'}
              </p>
            </div>
          </div>
        </form>
      );
    } 
      
return (
        <div className='row'>
          <div className='col-12'>
            <form onSubmit={this.handleFormSubmit}>
              <label data-testid='node-count-selector-picker'>
                <NumberPicker
                  label=''
                  min={minValue}
                  max={maxValue}
                  onChange={this.updateNodeCount}
                  readOnly={readOnly}
                  stepSize={DEFAULT_VALUE_CONSTRAINTS.stepSize}
                  value={scaling.max}
                />
              </label>
            </form>
          </div>
        </div>
      );
    
  }
}

NodeCountSelector.defaultProps = {
  autoscalingEnabled: false,
  readOnly: false,
  minValue: DEFAULT_VALUE_CONSTRAINTS.min,
  maxValue: DEFAULT_VALUE_CONSTRAINTS.max,
  scaling: {
    min: DEFAULT_VALUE_CONSTRAINTS.min,
    minValid: true,
    max: DEFAULT_VALUE_CONSTRAINTS.max,
    maxValid: true,
  },
  onChange: () => {},
};

NodeCountSelector.propTypes = {
  autoscalingEnabled: PropTypes.bool,
  label: PropTypes.shape({
    min: PropTypes.string,
    max: PropTypes.string,
  }),
  minValue: PropTypes.number,
  maxValue: PropTypes.number,
  onChange: PropTypes.func,
  readOnly: PropTypes.bool,
  scaling: PropTypes.object,
};

export default NodeCountSelector;
