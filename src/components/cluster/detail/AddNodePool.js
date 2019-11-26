import * as Providers from 'shared/constants';
import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { hasAppropriateLength } from 'lib/helpers';
import { RadioWrapper } from '../new/CreateNodePoolsCluster';
import AvailabilityZonesParser from './AvailabilityZonesParser';
import AWSInstanceTypeSelector from '../new/AWSInstanceTypeSelector';
import BaseTransition from 'styles/transitions/BaseTransition';
import NodeCountSelector from 'shared/NodeCountSelector';
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

// Availability Zones styles
const Emphasized = css`
  .emphasized {
    margin: 0 18px 0 28px;
    transform: translateY(-4px);
  }
`;

export const FlexWrapperAZDiv = styled.div`
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

const RadioWrapperDiv = styled.div`
  div {
    ${RadioWrapper};
  }
`;

const AZLabel = styled.label`
  height: 238px;
  justify-content: flex-start !important;
  position: relative;
  transition: height 0.3s;
  transition-delay: 0s;
  &.with-labels {
    transition: height 0.3s;
    transition-delay: 0.4s;
    height: 170px;
  }
  div label {
    justify-content: flex-start;
  }
  /* Automatic */
  .az-automatic-enter {
    opacity: 0.01;
    transform: translateY(-8px);
  }
  .az-automatic-enter.az-automatic-enter-active {
    opacity: 1;
    transform: translateY(0px);
    transition: all 500ms;
    transition-delay: 300ms;
  }
  .az-automatic-exit {
    transform: translateY(0px);
    opacity: 1;
  }
  .az-automatic-exit.az-automatic-exit-active {
    opacity: 0.01;
    transform: translateY(0px);
    transition: all 500ms;
  }

  /* Manual */
  .az-manual-enter,
  .az-manual-appear {
    opacity: 0.01;
    transform: translateY(20px);
  }
  .az-manual-enter.az-manual-enter-active,
  .az-manual-appear.az-manual-appear-active {
    opacity: 1;
    transform: translateY(0px);
    transition: opacity 200ms, transform 300ms;
    transition-delay: 300ms, 300ms;
  }
  .az-manual-exit {
    opacity: 1;
  }
  .az-manual-exit.az-manual-exit-active {
    opacity: 0.01;
    transform: translateY(0px);
    transition: all 100ms ease-in;
    transition-delay: 0ms;
  }

  /* Manual Radio Input */
  .manual-radio-input {
    position: absolute;
    top: 75px;
    width: 100%;
    transition: transform 300ms;
    transition-delay: 200ms;
    &.down {
      transform: translateY(125px);
      transition: transform 200ms;
      transition-delay: 0.2s;
    }
  }
`;

class AddNodePool extends Component {
  state = {
    name: {
      value: this.props.name,
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
    const [isValid, message] = hasAppropriateLength(name, 0, 100);

    // We don't let the user write more characters if the name exceeds the max number allowed
    if (!isValid) {
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

  toggleAZSelector = isLabels => {
    this.setState({
      hasAZLabels: isLabels,
    });
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

  isValid = () => {
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
    const isValid =
      scaling.minValid &&
      scaling.maxValid &&
      aws.instanceType.valid &&
      name.valid &&
      ((hasAZLabels && availabilityZonesLabels.valid) ||
        (!hasAZLabels && availabilityZonesPicker.valid))
        ? true
        : false;

    this.props.informParent(
      {
        isValid,
        data: {
          // TODO Is the endpoint expecting to receive either a string or a number??
          availability_zones: this.state.hasAZLabels
            ? { zones: this.state.availabilityZonesLabels.zonesArray }
            : { number: this.state.availabilityZonesPicker.value },
          scaling: {
            min: this.state.scaling.min,
            max: this.state.scaling.max,
          },
          name:
            this.state.name.value === ''
              ? 'Unnamed node pool'
              : this.state.name.value,
          node_spec: {
            aws: {
              instance_type: this.state.aws.instanceType.value,
            },
          },
        },
      },
      // We need to know which node pool it is in the v5 cluster creation form
      this.props.id ? this.props.id : null
    );
  };

  produceRAMAndCores = () => {
    const instanceType = this.state.aws.instanceType.value;
    // Check whether this.state.instanceTypes is populated and that instance name
    // in input matches an instance in the array
    const instanceTypesKeys = Object.keys(this.state.awsInstanceTypes);

    const hasInstances =
      instanceTypesKeys && instanceTypesKeys.includes(instanceType);

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
    const { zonesArray } = this.state.availabilityZonesLabels;
    const { hasAZLabels, name } = this.state;
    const { minAZ, maxAZ, defaultAZ } = this.props;

    return (
      <>
        <label htmlFor='name'>
          <span className='label-span'>Name</span>
          <div className='name-container'>
            <input
              value={name.value}
              onChange={this.updateName}
              id='name'
              type='text'
              placeholder={name.value === '' ? 'Unnamed node pool' : null}
            ></input>
            <ValidationErrorMessage message={name.validationError} />
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
            <p>{`${CPUCores} CPU cores, ${RAM} GB RAM each`}</p>
          </FlexWrapperDiv>
        </label>
        <AZLabel
          htmlFor='availability-zones'
          className={hasAZLabels && 'with-labels'}
        >
          <span className='label-span'>Availability Zones selection</span>
          <RadioWrapperDiv>
            {/* Automatically */}
            <div>
              <div className='fake-radio'>
                <div
                  className={`fake-radio-checked ${hasAZLabels === false &&
                    'visible'}`}
                />
              </div>
              <input
                type='radio'
                id={`automatically-${this.props.id}`}
                value={false}
                checked={hasAZLabels === false}
                onChange={() => this.toggleAZSelector(false)}
                tabIndex='0'
              />
              <label
                htmlFor='automatically'
                onClick={() => this.toggleAZSelector(false)}
              >
                Automatic
              </label>
            </div>
          </RadioWrapperDiv>
          <BaseTransition
            in={!hasAZLabels}
            timeout={{
              enter: 500,
              exit: 300,
            }}
            classNames='az-automatic'
          >
            <div key='az-automatic'>
              <FlexWrapperAZDiv>
                <p className='emphasized no-margin'>
                  Number of availability zones to use:
                </p>
                <AvailabilityZonesParser
                  min={minAZ}
                  max={maxAZ}
                  defaultValue={defaultAZ}
                  zones={this.props.availabilityZones}
                  updateAZValuesInParent={this.updateAZ}
                  isLabels={hasAZLabels}
                />
              </FlexWrapperAZDiv>
              <FlexWrapperAZDiv>
                {/* This is a hack for fixing height for this element and at the same time
                  control the height of the wrapper so it matches labels wrapper */}
                <p style={{ margin: '5px 0 24px 28px', height: '38px' }}>
                  {this.state.availabilityZonesPicker.value < 2
                    ? `Covering one availability zone, the worker nodes of this node pool
                      will be placed in the same availability zone as the
                      cluster's master node.`
                    : `Availability zones will be selected randomly.`}
                </p>
              </FlexWrapperAZDiv>
            </div>
          </BaseTransition>
          {/* Manual */}
          <RadioWrapperDiv
            className={`manual-radio-input ${!hasAZLabels ? 'down' : null}`}
          >
            <div>
              <div className='fake-radio'>
                <div
                  className={`fake-radio-checked ${hasAZLabels === true &&
                    'visible'}`}
                />
              </div>
              <input
                type='radio'
                id={`manually-${this.props.id}`}
                value={true}
                checked={hasAZLabels === true}
                tabIndex='0'
                onChange={() => this.toggleAZSelector(true)}
              />
              <label
                htmlFor='manually'
                onClick={() => this.toggleAZSelector(true)}
              >
                Manual
              </label>
            </div>
            <BaseTransition
              in={hasAZLabels}
              appear={true}
              timeout={{
                appear: 500,
                enter: 500,
                exit: 100,
              }}
              classNames='az-manual'
            >
              <div key='az-manual'>
                <FlexColumnAZDiv>
                  <p>
                    You can select up to {maxAZ} availability zones to make use
                    of.
                  </p>
                  <FlexWrapperAZDiv>
                    <AvailabilityZonesParser
                      min={minAZ}
                      max={maxAZ}
                      defaultValue={2}
                      zones={this.props.availabilityZones}
                      updateAZValuesInParent={this.updateAZ}
                      isLabels={hasAZLabels}
                    />
                    {/* Validation messages */}
                    {zonesArray.length < 1 && (
                      <p className='danger'>Please select at least one.</p>
                    )}
                    {zonesArray.length > maxAZ && (
                      <p className='danger'>
                        {maxAZ} is the maximum you can have. Please uncheck at
                        least {zonesArray.length - maxAZ} of them.
                      </p>
                    )}
                  </FlexWrapperAZDiv>
                </FlexColumnAZDiv>
              </div>
            </BaseTransition>
          </RadioWrapperDiv>
        </AZLabel>
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
        <p style={{ marginBottom: '31px' }}>
          To enable autoscaling, set minimum and maximum to different values.
        </p>
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
  closeForm: PropTypes.func,
  informParent: PropTypes.func,
  name: PropTypes.string,
  id: PropTypes.string,
  selectedRelease: PropTypes.string,
  maxAZ: PropTypes.number,
  minAZ: PropTypes.number,
  defaultAZ: PropTypes.number,
};

AddNodePool.defaultProps = {
  name: 'My node pool',
};

function mapStateToProps(state) {
  const { availability_zones: AZ } = state.app.info.general;
  const availabilityZones = AZ.zones;
  // More than 4 AZs is not allowed by now.
  const maxAZ = Math.min(AZ.max, 4);
  const minAZ = 1;
  const defaultAZ = AZ.default;
  const selectedOrganization = state.app.selectedOrganization;
  const provider = state.app.info.general.provider;
  const clusterCreationStats = state.app.info.stats.cluster_creation_duration;

  const defaultInstanceType =
    state.app.info.workers.instance_type &&
    state.app.info.workers.instance_type.default
      ? state.app.info.workers.instance_type.default
      : 'm3.large';

  const defaultCPUCores = 4; // TODO
  const defaultMemorySize = 4; // TODO
  const defaultDiskSize = 20; // TODO

  const allowedInstanceTypes =
    provider === Providers.AWS
      ? state.app.info.workers.instance_type.options
      : [];

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
    minAZ,
    maxAZ,
    defaultAZ,
  };
}

export default connect(mapStateToProps)(AddNodePool);
