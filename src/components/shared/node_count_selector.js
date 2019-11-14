import { connect } from 'react-redux';
import NumberPicker from 'UI/number_picker';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

// NodeCountSelector is a component that allows a user to pick a number of
// nodes by incrementing / decrementing a node count value or adjusting min and
// max values for scaling limits.
//
// State explanation:
//
// scaling - The current value of the input field[s].
//

const DEFAULT_VALUE_CONSTRAINTS = {
  min: 1,
  max: 999,
};

const SpanWrapper = styled.span`
  display: block;
  margin-bottom: 10px;
`;

class NodeCountSelector extends React.Component {
  state = {
    scaling: this.props.scaling,
  };

  updateScalingMin = numberPicker => {
    this.setState(
      {
        scaling: {
          min: numberPicker.value,
          minValid: numberPicker.valid,
          max: this.state.scaling.max,
          maxValid: this.state.scaling.maxValid,
        },
      },
      () => {
        this.props.onChange(this.state);
      }
    );
  };

  updateScalingMax = numberPicker => {
    this.setState(
      {
        scaling: {
          min: this.state.scaling.min,
          minValid: this.state.scaling.minValid,
          max: numberPicker.value,
          maxValid: numberPicker.valid,
        },
      },
      () => {
        this.props.onChange(this.state);
      }
    );
  };

  updateNodeCount = numberPicker => {
    this.setState(
      {
        scaling: {
          min: numberPicker.value,
          minValid: numberPicker.valid,
          max: numberPicker.value,
          maxValid: numberPicker.valid,
        },
      },
      () => {
        this.props.onChange(this.state);
      }
    );
  };

  handleFocus = event => {
    event.target.select();
  };

  render() {
    const { label, readOnly, maxValue, minValue } = this.props;

    if (this.props.autoscalingEnabled === true) {
      return (
        <form
          onSubmit={e => {
            e.preventDefault();
          }}
        >
          <div className='row'>
            <div className='col-6'>
              <label>
                <SpanWrapper>
                  {label && label.min ? label.min : 'Minimum'}
                </SpanWrapper>
                <NumberPicker
                  label=''
                  max={this.state.scaling.max}
                  min={minValue}
                  onChange={this.updateScalingMin}
                  readOnly={readOnly}
                  stepSize={1}
                  value={this.state.scaling.min}
                />
              </label>
            </div>
            <div className='col-6'>
              <label>
                <SpanWrapper>
                  {label && label.max ? label.max : 'Maximum'}
                </SpanWrapper>
                <NumberPicker
                  label=''
                  max={maxValue}
                  min={this.state.scaling.min}
                  onChange={this.updateScalingMax}
                  readOnly={readOnly}
                  stepSize={1}
                  value={this.state.scaling.max}
                />
              </label>
            </div>
          </div>
          <div className='row'>
            <div className='col-12'>
              <p>
                {this.state.scaling.min === this.state.scaling.max
                  ? 'To enable autoscaling, set minimum and maximum to different values.'
                  : 'To disable autoscaling, set both numbers to the same value.'}
              </p>
            </div>
          </div>
        </form>
      );
    } else {
      return (
        <div className='row'>
          <div className='col-12'>
            <form
              onSubmit={e => {
                e.preventDefault();
              }}
            >
              <NumberPicker
                label=''
                min={minValue}
                max={maxValue}
                onChange={this.updateNodeCount}
                readOnly={readOnly}
                stepSize={1}
                value={this.state.scaling.max}
              />
            </form>
          </div>
        </div>
      );
    }
  }
}

NodeCountSelector.defaultProps = {
  readOnly: false,
  minValue: DEFAULT_VALUE_CONSTRAINTS.min,
  maxValue: DEFAULT_VALUE_CONSTRAINTS.max,
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

function mapStateToProps() {
  return {};
}

function mapDispatchToProps() {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NodeCountSelector);
