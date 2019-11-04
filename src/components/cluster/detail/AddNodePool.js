import { connect } from 'react-redux';
import { css } from '@emotion/core';
import { hasAppropriateLength } from 'lib/helpers';
import { RadioWrapper } from '../new/CreateNodePoolsCluster';
import AvailabilityZonesParser from './AvailabilityZonesParser';
import AWSInstanceTypeSelector from '../new/aws_instance_type_selector';
import NodeCountSelector from 'shared/node_count_selector';
import produce from 'immer';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
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
  div label {
    justify-content: flex-start;
  }

  .az-automatic-enter {
    opacity: 0.01;
    transform: translateY(-8px);
  }
  .az-automatic-enter.az-automatic-enter-active {
    opacity: 1;
    transform: translateY(0px);
    transition: all 300ms;
  }
  .az-automatic-leave {
    transform: translateY(0px);
    opacity: 1;
  }
  .az-automatic-leave.az-automatic-leave-active {
    opacity: 0.01;
    transform: translateY(0px);
    transition: all 300ms;
  }

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
  .az-manual-leave {
    opacity: 1;
  }
  .az-manual-leave.az-manual-leave-active {
    opacity: 0.01;
    transform: translateY(0px);
    transition: all 100ms ease-in;
    transition-delay: 0ms;
  }

  /* Manual */
  .manual-radio-input {
    position: absolute;
    top: 75px;
    width: 100%;
    transition: transform 300ms;
    transition-delay: 200ms;
    &.down {
      transform: translateY(125px);
      transition: transform 200ms;
      transition-delay: 0ms;
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
          availabilityZones: this.state.hasAZLabels
            ? this.state.availabilityZonesLabels.zonesString
            : this.state.availabilityZonesPicker.value,
          scaling: {
            min: this.state.scaling.min,
            max: this.state.scaling.max,
          },
          name:
            this.state.name.value === ''
              ? 'Unnamed node pool'
              : this.state.name.value,
          nodeSpec: {
            aws: {
              instance_type: this.state.aws.instanceType.value,
            },
          },
        },
      },
      // We need to know wich node pool it is in the v5 cluster creation form
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
    const { min, max } = window.config.nodePoolAZLimits;
    const { zonesArray } = this.state.availabilityZonesLabels;
    const { hasAZLabels, name } = this.state;

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
        <AZLabel htmlFor='availability-zones'>
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
                id='automatically'
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
          <ReactCSSTransitionGroup
            transitionName='az-automatic'
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}
          >
            {!hasAZLabels && (
              <div key='az-automatic'>
                <FlexWrapperAZDiv>
                  <p className='emphasized no-margin'>
                    Number of availability zones to use:
                  </p>
                  <AvailabilityZonesParser
                    min={min}
                    max={max}
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
                      will be placed in the same availability zones as the
                      cluster's master node.`
                      : `Availability zones will be selected randomly.`}
                  </p>
                </FlexWrapperAZDiv>
              </div>
            )}
          </ReactCSSTransitionGroup>
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
                id='manually'
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
            <ReactCSSTransitionGroup
              transitionName='az-manual'
              transitionEnterTimeout={500}
              transitionLeaveTimeout={100}
              transitionAppearTimeout={500}
              transitionAppear={true}
            >
              {hasAZLabels && (
                <div key='az-manual'>
                  <FlexColumnAZDiv>
                    <p>
                      You can select up to {max} availability zones to make use
                      of.
                    </p>
                    <FlexWrapperAZDiv>
                      <AvailabilityZonesParser
                        min={min}
                        max={max}
                        zones={this.props.availabilityZones}
                        updateAZValuesInParent={this.updateAZ}
                        isLabels={hasAZLabels}
                      />
                      {/* Validation messages */}
                      {zonesArray.length < 1 && (
                        <p className='danger'>Please select at least one.</p>
                      )}
                      {zonesArray.length > max && (
                        <p className='danger'>
                          {max} is the maximum you can have. Please uncheck at
                          least {zonesArray.length - max} of them.
                        </p>
                      )}
                    </FlexWrapperAZDiv>
                  </FlexColumnAZDiv>
                </div>
              )}
            </ReactCSSTransitionGroup>
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
  clusterId: PropTypes.string,
  closeForm: PropTypes.func,
  informParent: PropTypes.func,
  name: PropTypes.string,
  id: PropTypes.string,
};

AddNodePool.defaultProps = {
  name: 'My node pool',
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
