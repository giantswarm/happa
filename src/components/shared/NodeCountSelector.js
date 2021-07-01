import { Text } from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import NumberPicker from 'UI/Inputs/NumberPicker';
import TwoInputArea, { InnerTwoInputArea } from 'UI/Layout/TwoInputArea';

const DEFAULT_VALUE_CONSTRAINTS = {
  min: 0,
  max: 999,
  step: 1,
};

/**
 * NodeCountSelector is a component that allows a user to pick a number of
 * nodes by incrementing / decrementing a node count value or adjusting min and
 * max values for scaling limits.
 */
class NodeCountSelector extends React.Component {
  updateValue(valuesToAdd) {
    const nextScalingValue = Object.assign({}, this.props.scaling, valuesToAdd);

    this.props.onChange({
      scaling: nextScalingValue,
    });
  }

  updateScalingMin = (numberPicker) => {
    this.updateValue({ min: numberPicker.value, minValid: numberPicker.valid });
  };

  updateScalingMax = (numberPicker) => {
    this.updateValue({
      max: numberPicker.value,
      maxValid: numberPicker.valid,
    });
  };

  updateNodeCount = (numberPicker) => {
    this.updateValue({
      min: numberPicker.value,
      minValid: numberPicker.valid,
      max: numberPicker.value,
      maxValid: numberPicker.valid,
    });
  };

  handleFocus = (event) => {
    event.target.select();
  };

  render() {
    const { label, readOnly, maxValue, minValue, scaling } = this.props;

    if (this.props.autoscalingEnabled === true) {
      return (
        <div>
          <TwoInputArea>
            <InnerTwoInputArea>
              <NumberPicker
                id='minimum'
                label={label?.min ?? 'Minimum'}
                max={scaling.max}
                min={minValue}
                onChange={this.updateScalingMin}
                readOnly={readOnly}
                step={DEFAULT_VALUE_CONSTRAINTS.step}
                value={scaling.min}
                contentProps={{
                  width: 'small',
                }}
              />
            </InnerTwoInputArea>
            <InnerTwoInputArea>
              <NumberPicker
                id='maximum'
                label={label?.max ?? 'Maximum'}
                max={maxValue}
                min={scaling.min}
                onChange={this.updateScalingMax}
                readOnly={readOnly}
                step={DEFAULT_VALUE_CONSTRAINTS.step}
                value={scaling.max}
                contentProps={{
                  width: 'small',
                }}
              />
            </InnerTwoInputArea>
          </TwoInputArea>
          <Text data-testid='node-count-selector-autoscaling-label'>
            {scaling.min === scaling.max
              ? 'To enable autoscaling, set minimum and maximum to different values.'
              : 'To disable autoscaling, set both numbers to the same value.'}
          </Text>
        </div>
      );
    }

    return (
      <div>
        <NumberPicker
          min={minValue}
          max={maxValue}
          onChange={this.updateNodeCount}
          readOnly={readOnly}
          step={DEFAULT_VALUE_CONSTRAINTS.step}
          value={scaling.min}
          id='count'
          title='Count'
          contentProps={{
            width: 'small',
          }}
        />
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
  // eslint-disable-next-line no-empty-function
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
