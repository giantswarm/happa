import { connect } from 'react-redux';
import { nodePoolCreate } from 'actions/nodePoolActions';
import AddNodePoolsAvailabilityZones from './AddNodePoolsAvailabilityZones';
import AWSInstanceTypeSelector from '../new/aws_instance_type_selector';
import Button from 'UI/button';
import NodeCountSelector from 'shared/node_count_selector';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from '@emotion/styled';
import ValidationErrorMessage from 'UI/ValidationErrorMessage';

const WrapperDiv = styled.div`
  background-color: ${props => props.theme.colors.shade7};
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 40px;
  h3 {
    margin-bottom: 20px;
  }
`;

const FlexWrapperDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 13px;
  & > div:nth-of-type(2) > button {
    padding-top: 9px;
    padding-bottom: 9px;
  }
  button {
    margin-right: 16px;
  }
  .availability-zones & {
    margin-bottom: 22px;
  }
  p {
    margin-left: 15px;
  }
`;

const FlexColumnDiv = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  margin: 0 auto;
  max-width: 650px;
  label {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    margin: 0 0 31px;
    &.instance-type {
      margin-bottom: 21px;
    }
    p {
      line-height: 1.4;
    }
  }
  .label-span {
    color: ${props => props.theme.colors.white1};
  }
  .label-span,
  input,
  select {
    font-size: 16px;
    margin-bottom: 13px;
    font-weight: 400;
  }
  input {
    box-sizing: border-box;
    width: 100%;
    background-color: ${props => props.theme.colors.shade5};
    padding: 11px 10px;
    outline: 0;
    color: ${props => props.theme.colors.whiteInput};
    border-radius: 4px;
    border: 1px solid ${props => props.theme.colors.shade6};
    padding-left: 15px;
    line-height: normal;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: ${props => props.theme.colors.white1};
  }
  a {
    text-decoration: underline;
  }
  /* Name input */
  .name-container {
    position: relative;
    margin-bottom: 23px;
  }
  input[id='name'] {
    margin-bottom: 0;
  }
  /* Overrides for AWSInstanceTypeSelector */
  .textfield label,
  .textfield,
  .textfield input {
    margin: 0;
  }
  /* Overrides for NumberPicker */
  .availability-zones {
    & > div > div,
    & > div > div > div {
      margin: 0;
    }
  }
  .scaling-range {
    form {
      label {
        margin-bottom: 7px;
        color: ${props => props.theme.colors.white1};
        font-weight: 400;
      }
      & > div:nth-of-type(2) {
        display: none;
      }
    }
  }
`;

class AddNodePool extends Component {
  state = {
    isNameBeingEdited: false,
    name: {
      value: 'My node pool',
      valid: true,
      validationError: '',
    },
    availabilityZonesPicker: {
      value: 1,
      valid: true,
    },
    availabilityZonesLabels: {
      number: 0,
      zonesString: '',
      zonesArray: [],
      valid: false,
    },
    availabilityZonesIsLabels: false,
    releaseVersion: '',
    scaling: {
      automatic: false,
      min: 3,
      minValid: true,
      max: 10,
      maxValid: true,
    },
    submitting: false,
    valid: false,
    error: false,
    aws: {
      instanceType: {
        valid: true,
        value: this.props.defaultInstanceType,
      },
    },
    awsInstanceTypes: {},
  };

  componentDidMount() {
    const awsInstanceTypes = JSON.parse(window.config.awsCapabilitiesJSON);
    this.setState({ awsInstanceTypes });
  }

  updateName = event => {
    const name = event.target.value;
    const exceededMaximumCharacters = name.length > 100;
    const isValid = exceededMaximumCharacters ? false : true;
    const message = isValid
      ? ''
      : 'Name must not contain more than 100 characters';

    // We don't let the user write more characters if the name exceeds the max number allowed
    if (exceededMaximumCharacters) {
      this.setState(
        produce(draft => {
          draft.name.validationError = message;
        })
      );
      return;
    }

    this.setState(
      produce(draft => {
        draft.name.valid = isValid;
        draft.name.value = name;
        draft.name.validationError = message;
      })
    );
  };

  updateAWSInstanceType = payload => {
    this.setState(
      produce(draft => {
        draft.aws.instanceType = payload;
      })
    );
  };

  updateAvailabilityZonesIsLabels = availabilityZonesIsLabels =>
    this.setState({ availabilityZonesIsLabels });

  updateAvailabilityZones = payload => {
    if (this.state.availabilityZonesIsLabels) {
      this.setState({ availabilityZonesLabels: payload });
    } else {
      this.setState({ availabilityZonesPicker: payload });
    }
  };

  updateScaling = nodeCountSelector => {
    this.setState({ scaling: nodeCountSelector.scaling });
  };

  // Always true?
  isScalingAutomatic = () => true;

  isValid() {
    // Not checking release version as we would be checking it before accessing this form
    // and sending user too the v4 form if NPs aren't supported
    const {
      availabilityZonesPicker,
      availabilityZonesLabels,
      availabilityZonesIsLabels,
      scaling,
      aws,
      name,
    } = this.state;

    // Should we check the validity of the release somewhere?
    if (
      scaling.minValid &&
      scaling.maxValid &&
      aws.instanceType.valid &&
      name.valid &&
      ((availabilityZonesIsLabels && availabilityZonesLabels.valid) ||
        (!availabilityZonesIsLabels && availabilityZonesPicker.valid))
    ) {
      return true;
    }

    return false;
  }

  createNodePool = () => {
    this.setState({ submitting: true });

    this.props
      .dispatch(
        nodePoolCreate(this.props.clusterId, {
          // TODO Is the endpoint expecting to receive either a string or a number??
          availabilityZones: this.state.availabilityZonesIsLabels
            ? this.state.availabilityZonesLabels.zonesString
            : this.state.availabilityZonesPicker.value,
          scaling: {
            min: this.state.scaling.min,
            max: this.state.scaling.max,
          },
          name: this.state.name,
          nodeSpec: {
            aws: {
              instance_type: this.state.aws.instanceType.value,
            },
          },
        })
      )
      .then(() => {
        this.props.closeForm();
      })
      .catch(error => {
        var errorMessage = '';

        if (error.body && error.body.message) {
          errorMessage = error.body.message;
        }

        this.setState({
          submitting: false,
          error: error,
          errorMessage: errorMessage,
        });
      });
  };

  produceRAMAndCores = () => {
    const instanceType = this.state.aws.instanceType.value;
    // Check whether this.state.instanceTypes is populated and that instance name
    // in input matches an instance in the array
    const instanceTypesKeys = Object.keys(this.state.awsInstanceTypes);

    const hasInstances =
      instanceTypesKeys.length > 0 &&
      instanceTypesKeys.find(type => type === instanceType);

    const RAM = hasInstances
      ? this.state.awsInstanceTypes[instanceType].memory_size_gb
      : '0';

    const CPUCores = hasInstances
      ? this.state.awsInstanceTypes[instanceType].cpu_cores
      : '0';

    return [RAM, CPUCores];
  };

  toggleAZ = () => this.setState(state => ({ AZToggle: !state.AZToggle }));

  render() {
    const [RAM, CPUCores] = this.produceRAMAndCores();

    return (
      <WrapperDiv>
        <h3 className='table-label'>Add Node Pool</h3>
        <FlexColumnDiv>
          <label htmlFor='name'>
            <span className='label-span'>Name</span>
            <div className='name-container'>
              <input
                value={this.state.name.value}
                onChange={this.updateName}
                id='name'
                type='text'
              ></input>
              <ValidationErrorMessage
                message={this.state.name.validationError}
              />
            </div>
            <p>
              Pick a name that helps team mates to understand what these nodes
              are here for. You can change this later. Each node pool also gets
              a unique identifier.
            </p>
          </label>
          <label className='instance-type' htmlFor='instance-type'>
            <span className='label-span'>Instance type</span>
            <FlexWrapperDiv>
              <AWSInstanceTypeSelector
                allowedInstanceTypes={this.props.allowedInstanceTypes}
                onChange={this.updateAWSInstanceType}
                readOnly={false}
                value={this.state.aws.instanceType.value}
              />
              <p>{`${RAM} CPU cores, ${CPUCores} GB RAM each`}</p>
            </FlexWrapperDiv>
          </label>
          <label className='availability-zones' htmlFor='availability-zones'>
            <span className='label-span'>Availability Zones</span>
            <AddNodePoolsAvailabilityZones
              min={window.config.availabilityZonesLimits.min}
              max={window.config.availabilityZonesLimits.max}
              zones={this.props.availabilityZones}
              updateAZValuesInParent={this.updateAvailabilityZones}
              updateIsLabelsInParent={this.updateAvailabilityZonesIsLabels}
            />
          </label>
          <label className='scaling-range' htmlFor='scaling-range'>
            <span className='label-span'>Scaling range</span>
            <NodeCountSelector
              autoscalingEnabled={true}
              label={{ max: 'MAX', min: 'MIN' }}
              onChange={this.updateScaling}
              readOnly={false}
              scaling={this.state.scaling}
            />
          </label>
          <FlexWrapperDiv>
            <Button
              bsSize='large'
              bsStyle='primary'
              disabled={!this.isValid()}
              loading={this.state.submitting}
              onClick={this.createNodePool}
              type='button'
            >
              Create Node Pool
            </Button>
            <Button
              bsSize='large'
              bsStyle='default'
              loading={this.state.submitting}
              onClick={this.props.closeForm}
              style={{ background: 'red' }}
              type='button'
            >
              Cancel
            </Button>
          </FlexWrapperDiv>
        </FlexColumnDiv>
      </WrapperDiv>
    );
  }
}

AddNodePool.propTypes = {
  availabilityZones: PropTypes.array,
  allowedInstanceTypes: PropTypes.array,
  selectedOrganization: PropTypes.string,
  dispatch: PropTypes.func,
  provider: PropTypes.string,
  defaultInstanceType: PropTypes.string,
  defaultCPUCores: PropTypes.number,
  defaultMemorySize: PropTypes.number,
  defaultDiskSize: PropTypes.number,
  match: PropTypes.object,
  clusterCreationStats: PropTypes.object,
  clusterId: PropTypes.string,
  closeForm: PropTypes.func,
};

function mapStateToProps(state) {
  let availabilityZones = state.app.info.general.availability_zones.zones;
  let selectedOrganization = state.app.selectedOrganization;
  const provider = state.app.info.general.provider;
  let clusterCreationStats = state.app.info.stats.cluster_creation_duration;

  var defaultInstanceType;
  if (
    state.app.info.workers.instance_type &&
    state.app.info.workers.instance_type.default
  ) {
    defaultInstanceType = state.app.info.workers.instance_type.default;
  } else {
    defaultInstanceType = 'm3.large';
  }

  const defaultCPUCores = 4; // TODO
  const defaultMemorySize = 4; // TODO
  const defaultDiskSize = 20; // TODO

  const allowedInstanceTypes =
    provider === 'aws' ? state.app.info.workers.instance_type.options : [];

  return {
    availabilityZones,
    allowedInstanceTypes,
    provider,
    defaultInstanceType,
    defaultCPUCores,
    defaultMemorySize,
    defaultDiskSize,
    selectedOrganization,
    clusterCreationStats,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(AddNodePool);
