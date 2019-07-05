import { connect } from 'react-redux';
import NumberPicker from '../UI/number_picker';
import PropTypes from 'prop-types';
import React from 'react';

// NodeCountSelector is a component that allows a user to pick a number of
// nodes by incrementing / decrementing a node count value or adjusting min and
// max values for scaling limits.
//
// State explanation:
//
// autoscalingEnabled - Boolean whether cluster supports autoscaling or not.
//                      This is used to determine whether only number of nodes
//                      is displayed of if there is pickers for min/max values.
//
// scaling - The current value of the input field[s].
//

class NodeCountSelector extends React.Component {
  state = {
    autoscalingEnabled: this.props.autoscalingEnabled,
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
    if (this.props.autoscalingEnabled === true) {
      return (
        <form
          onSubmit={e => {
            e.preventDefault();
          }}
        >
          <div className='row'>
            <div className='col-6'>
              <label>Minimum</label>
              <NumberPicker
                label=''
                max={this.state.scaling.max}
                min={1}
                onChange={this.updateScalingMin}
                readOnly={false}
                stepSize={1}
                value={this.state.scaling.min}
              />
            </div>
            <div className='col-6'>
              <label>Maximum</label>
              <NumberPicker
                label=''
                max={99}
                min={this.state.scaling.min}
                onChange={this.updateScalingMax}
                readOnly={false} // TODO
                stepSize={1}
                value={this.state.scaling.max}
              />
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
                max={99}
                min={1}
                onChange={this.updateNodeCount}
                readOnly={false} // TODO
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

NodeCountSelector.propTypes = {
  autoscalingEnabled: PropTypes.bool,
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
