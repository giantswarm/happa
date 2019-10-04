import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { hasAppropriateLength } from 'lib/helpers';
import { Input } from 'styles/index';
import { nodePoolCreate } from 'actions/nodePoolActions';
import AddNodePoolsAvailabilityZones from './AddNodePoolsAvailabilityZones';
import AWSInstanceTypeSelector from '../new/aws_instance_type_selector';
import NodeCountSelector from 'shared/node_count_selector';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from '@emotion/styled';
import ValidationErrorMessage from 'UI/ValidationErrorMessage';

const FlexWrapperDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
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
  ${Input};
  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.2;
    margin: 0;
    max-width: 550px;
    padding-left: 20px;
  }
`;

// Availability Zones styles
const Emphasized = css`
  .emphasized {
    font-size: 16px;
    span {
      text-decoration: underline;
      cursor: pointer;
    }
  }
  .no-margin {
    margin-left: 18px;
  }
`;

const FlexWrapperAZDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 2px;
  ${Emphasized};
  .danger {
    font-weight: 400;
    margin: 0 0 0 15px;
    color: ${props => props.theme.colors.error};
  }
`;

const FlexColumnAZDiv = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  p {
    font-size: 14px;
    margin: 0 0 14px 0;
    &:nth-of-type(2) {
      margin: 12px 0 25px;
    }
  }
  div {
    margin-bottom: 20px;
  }
  ${Emphasized};
`;

// TODO Put this in a config file after moving it from index.html
const availabilityZonesLimits = {
  min: 1,
  max: 4,
};

class AddNodePool extends Component {
  state = {
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
    // Labels or Input? Initially set to false, so the input is shown
    hasAZLabels: false,
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
    this.setState({
      awsInstanceTypes: JSON.parse(window.config.awsCapabilitiesJSON),
    });
  }

  componentDidUpdate() {
    this.isValid();
  }

  updateName = event => {
    const name = event.target.value;
    const [isValid, message] = hasAppropriateLength(name, 4, 100);

    // We don't let the user write more characters if the name exceeds the max number allowed
    if (!isValid) {
      this.setState(
        produce(draft => {
          draft.name.validationError = message;
        })
      );
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

  toggleAZSelector = () => {
    this.setState(state => ({
      hasAZLabels: !state.hasAZLabels,
    }));
  };

  updateAZ = payload => {
    if (this.state.hasAZLabels) {
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
      hasAZLabels,
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
      ((hasAZLabels && availabilityZonesLabels.valid) ||
        (!hasAZLabels && availabilityZonesPicker.valid))
    ) {
      this.props.informParent({
        isValid: true,
        data: {
          // TODO Is the endpoint expecting to receive either a string or a number??
          availabilityZones: this.state.hasAZLabels
            ? this.state.availabilityZonesLabels.zonesString
            : this.state.availabilityZonesPicker.value,
          scaling: {
            min: this.state.scaling.min,
            max: this.state.scaling.max,
          },
          name: this.state.name.value,
          nodeSpec: {
            aws: {
              instance_type: this.state.aws.instanceType.value,
            },
          },
        },
      });
      return;
    }

    this.props.informParent({ isValid: false });
  }

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

  render() {
    const [RAM, CPUCores] = this.produceRAMAndCores();
    const { min, max } = availabilityZonesLimits;
    const { zonesArray } = this.state.availabilityZonesLabels;

    return (
      <>
        <label htmlFor='name'>
          <span className='label-span'>Name</span>
          <div className='name-container'>
            <input
              value={this.state.name.value}
              onChange={this.updateName}
              id='name'
              type='text'
            ></input>
            <ValidationErrorMessage message={this.state.name.validationError} />
          </div>
          <p>
            Pick a name that helps team mates to understand what these nodes are
            here for. You can change this later. Each node pool also gets a
            unique identifier.
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
          {this.state.hasAZLabels && (
            <FlexColumnAZDiv>
              <p>
                You can select up to {max} availability zones to make use of.
              </p>
              <FlexWrapperAZDiv>
                <AddNodePoolsAvailabilityZones
                  min={min}
                  max={max}
                  zones={this.props.availabilityZones}
                  updateAZValuesInParent={this.updateAZ}
                  isLabels={this.state.hasAZLabels}
                />
                {zonesArray.length < 1 && (
                  <p className='danger'>Please select at least one.</p>
                )}
                {zonesArray.length > max && (
                  <p className='danger'>
                    {max} is the maximum you can have. Please uncheck at least{' '}
                    {zonesArray.length - max} of them.
                  </p>
                )}
              </FlexWrapperAZDiv>
              <p className='emphasized'>
                <span
                  onClick={this.toggleAZSelector}
                  alt='Switch to random selection'
                >
                  Switch to random selection
                </span>
              </p>
            </FlexColumnAZDiv>
          )}
          {!this.state.hasAZLabels && (
            <>
              <FlexWrapperAZDiv>
                <AddNodePoolsAvailabilityZones
                  min={min}
                  max={max}
                  zones={this.props.availabilityZones}
                  updateAZValuesInParent={this.updateAZ}
                  isLabels={this.state.hasAZLabels}
                />
                <p className='emphasized no-margin'>
                  or{' '}
                  <span
                    onClick={this.toggleAZSelector}
                    alt='Select distinct availability zones'
                  >
                    Select distinct availability zones
                  </span>
                </p>
              </FlexWrapperAZDiv>
              <FlexWrapperAZDiv>
                {/* This is a hack for fixing height for this element and at the same time
                  control the height of the wrapper so it matches labels wrapper */}
                <p style={{ margin: '19px 0 22px', height: '38px' }}>
                  {this.state.availabilityZonesPicker.value < 2
                    ? `Covering one availability zone, the worker nodes of this node pool
               will be placed in the same availability zones as the
               cluster's master node.`
                    : `Availability zones will be selected randomly.`}
                </p>
              </FlexWrapperAZDiv>
            </>
          )}
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
      </>
    );
  }
}

AddNodePool.propTypes = {
  availabilityZones: PropTypes.array,
  allowedInstanceTypes: PropTypes.array,
  selectedOrganization: PropTypes.string,
  provider: PropTypes.string,
  defaultInstanceType: PropTypes.string,
  defaultCPUCores: PropTypes.number,
  defaultMemorySize: PropTypes.number,
  defaultDiskSize: PropTypes.number,
  match: PropTypes.object,
  clusterCreationStats: PropTypes.object,
  clusterId: PropTypes.string,
  closeForm: PropTypes.func,
  informParent: PropTypes.func,
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

export default connect(mapStateToProps)(AddNodePool);
