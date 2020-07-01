import { css } from '@emotion/core';
import styled from '@emotion/styled';
import produce from 'immer';
import { hasAppropriateLength } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import cmp from 'semver-compare';
import { Constants, Providers } from 'shared/constants';
import NodeCountSelector from 'shared/NodeCountSelector';
import BaseTransition from 'styles/transitions/BaseTransition';
import Checkbox from 'UI/Checkbox';
import ClusterCreationLabelSpan from 'UI/ClusterCreation/ClusterCreationLabelSpan';
import NameInput from 'UI/ClusterCreation/NameInput';
import Section from 'UI/ClusterCreation/Section';
import StyledInput, {
  AdditionalInputHint,
} from 'UI/ClusterCreation/StyledInput';
import { FlexColumn, FlexWrapperDiv } from 'UI/FlexDivs';
import NumberPicker from 'UI/NumberPicker';

import AvailabilityZonesParser from './AvailabilityZonesParser';
import InstanceTypeSelector from './InstanceTypeSelector/InstanceTypeSelector';

// Availability Zones styles
const Emphasized = css`
  .emphasized {
    font-size: 14px;
    line-height: 1.4;
    margin: 0 18px 0 28px;
    transform: translateY(-4px);
  }
  .indented {
    margin-left: 28px;
  }
`;

export const FlexWrapperAZDiv = styled(FlexWrapperDiv)`
  margin-bottom: 2px;
  ${Emphasized};
  .indented {
    font-size: 14px;
    line-height: 1.4;
  }
  .danger {
    font-weight: 400;
    margin: 0 0 0 15px;
    color: ${(props) => props.theme.colors.error};
  }
`;

const FlexColumnAZDiv = styled(FlexColumn)`
  flex-flow: column nowrap;
  margin: 0;
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
    display: flex;
    justify-content: flex-start;
    position: relative;
    label {
      font-size: 14px;
      font-weight: 300;
      margin-bottom: 0;
      cursor: pointer;
    }
    input {
      max-width: 28px;
      cursor: pointer;
      margin-right: 14px;
    }
    input[type='radio'] {
      opacity: 0;
    }
    .fake-radio {
      position: absolute;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      top: 4px;
      border: ${({ theme }) => theme.border};
      background: ${({ theme }) => theme.colors.white1};
      display: flex;
      justify-content: space-around;
      align-items: center;
      &-checked {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background-color: ${({ theme }) => theme.colors.white1};
        transition: background-color 0.2s;
        &.visible {
          background-color: ${({ theme }) => theme.colors.shade2};
        }
      }
    }
  }
`;

const AZLabel = styled.label`
  height: 238px;
  justify-content: flex-start !important;
  position: relative;
  transition: height 0.3s;
  transition-delay: 0s;
  /* Same margin-bottom as <Section /> */
  margin-bottom: ${({ theme }) => theme.spacingPx * 8}px;
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
  span input {
    font-weight: 400;
  }
`;

const AZSelectionLabel = styled(ClusterCreationLabelSpan)`
  display: block;
`;

const SpotValuesLabelText = styled.span`
  font-weight: 300;
  font-size: 16px;
  line-height: 32px;
  display: inline-block;
  width: 210px;
`;

const SpotValuesNumberPickerWrapper = styled.div`
  margin-bottom: 8px;

  .spot-number-picker {
    margin-right: 8px;
  }
`;

const SpotValuesHelpText = styled.p`
  padding-bottom: 20px;
  padding-left: 28px;
  font-size: 14px;
  i {
    white-space: nowrap;
  }
`;

const CheckboxWrapper = styled.div`
  .checkbox-label {
    font-size: 16px;
    font-weight: normal;
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
    // eslint-disable-next-line react/no-unused-state
    submitting: false,
    // eslint-disable-next-line react/no-unused-state
    valid: false,
    // eslint-disable-next-line react/no-unused-state
    error: false,
    aws: {
      instanceType: this.props.defaultInstanceType,
      useAlike: false,
      instanceDistribution: {
        onDemandBaseCapacity: 0,
        spotInstancePercentage: 100,
      },
    },
    spotInstancesEnabled: false,
    allowSpotInstances: false,
    allowAlikeInstances: false,
  };

  componentDidMount() {
    this.setState({
      ...this.computeInstanceCapabilities(),
    });
  }

  componentDidUpdate(prevProps) {
    this.isValid();
    const { selectedRelease: prevSelectedRelease } = prevProps;
    const { selectedRelease } = this.props;
    if (prevSelectedRelease !== selectedRelease) {
      this.setState(this.computeInstanceCapabilities());
    }
  }

  computeInstanceCapabilities = () => {
    const { selectedRelease, provider } = this.props;

    return {
      allowSpotInstances:
        provider === Providers.AWS &&
        cmp(Constants.AWS_ONDEMAND_INSTANCES_VERSION, selectedRelease) <= 0,
      allowAlikeInstances:
        provider === Providers.AWS &&
        cmp(Constants.AWS_USE_ALIKE_INSTANCES_VERSION, selectedRelease) <= 0,
    };
  };

  updateName = (name) => {
    const [isValid, message] = hasAppropriateLength(
      name,
      Constants.MIN_NAME_LENGTH,
      Constants.MAX_NAME_LENGTH
    );

    this.setState(
      produce((draft) => {
        draft.name.valid = isValid;
        draft.name.value = name;
        draft.name.validationError = message;
      })
    );
  };

  setAWSInstanceType = (instanceType) => {
    this.setState(({ aws }) => ({ aws: { ...aws, instanceType } }));
  };

  toggleAZSelector = (isLabels) => {
    this.setState({
      hasAZLabels: isLabels,
    });
  };

  setUseAlikeInstancesEnabled = (useAlike) => {
    this.setState(({ aws }) => ({ aws: { ...aws, useAlike } }));
  };

  setSpotInstancesEnabled = (spotInstancesEnabled) => {
    this.setState({ spotInstancesEnabled });
  };

  setSpotInstancePercentage = ({ value: spotInstancePercentage, valid }) => {
    if (valid) {
      this.setState(({ aws }) => ({
        aws: {
          ...aws,
          instanceDistribution: {
            ...aws.instanceDistribution,
            spotInstancePercentage,
          },
        },
      }));
    }
  };

  setOnDemandBaseCapacity = ({ value: onDemandBaseCapacity, valid }) => {
    if (valid) {
      this.setState(({ aws }) => ({
        aws: {
          ...aws,
          instanceDistribution: {
            ...aws.instanceDistribution,
            onDemandBaseCapacity,
          },
        },
      }));
    }
  };

  updateAZ = (payload) => {
    if (this.state.hasAZLabels) {
      this.setState({ availabilityZonesLabels: payload });
    } else {
      this.setState({ availabilityZonesPicker: payload });
    }
  };

  updateScaling = (nodeCountSelector) => {
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
      name,
    } = this.state;

    // Should we check the validity of the release somewhere?
    const isValid =
      scaling.minValid &&
      scaling.maxValid &&
      name.valid &&
      ((hasAZLabels && availabilityZonesLabels.valid) ||
        (!hasAZLabels && availabilityZonesPicker.valid))
        ? true
        : false;

    // defaults for disabled spot instances
    let instanceDistribution = {
      on_demand_base_capacity: 0,
      on_demand_percentage_above_base_capacity: 100,
    };

    if (this.state.spotInstancesEnabled) {
      instanceDistribution = {
        on_demand_base_capacity: this.state.aws.instanceDistribution
          .onDemandBaseCapacity,
        on_demand_percentage_above_base_capacity:
          /* eslint-disable-next-line no-magic-numbers */
          100 - this.state.aws.instanceDistribution.spotInstancePercentage,
      };
    }

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
              instance_type: this.state.aws.instanceType,
              use_alike_instance_types: this.state.aws.useAlike,
              instance_distribution: instanceDistribution,
            },
          },
        },
      },
      // We need to know which node pool it is in the v5 cluster creation form
      this.props.id ? this.props.id : null
    );
  };

  render() {
    const { zonesArray } = this.state.availabilityZonesLabels;
    const { hasAZLabels, name } = this.state;
    const { minAZ, maxAZ, defaultAZ } = this.props;

    return (
      <>
        <Section>
          <NameInput
            value={name.value}
            label='Name'
            inputId={`node-pool-name-${this.props.id}`}
            placeholder={name.value === '' ? 'Unnamed node pool' : null}
            validationError={name.validationError}
            onChange={this.updateName}
          />
          <AdditionalInputHint>
            Pick a name that helps team mates to understand what these nodes are
            here for. You can change this later. Each node pool also gets a
            unique identifier.
          </AdditionalInputHint>
        </Section>
        <Section>
          <StyledInput
            inputId={`instance-type-${this.props.id}`}
            label='Instance type'
            // regular space, hides hint ;)
            hint={<>&#32;</>}
          >
            <InstanceTypeSelector
              selectedInstanceType={this.state.aws.instanceType}
              selectInstanceType={this.setAWSInstanceType}
            />
          </StyledInput>
          {this.state.allowAlikeInstances && (
            <CheckboxWrapper>
              <Checkbox
                checked={this.state.aws.useAlike}
                onChange={this.setUseAlikeInstancesEnabled}
                label='Allow usage of similar instance types'
              />
            </CheckboxWrapper>
          )}
        </Section>
        <AZLabel
          htmlFor='availability-zones'
          className={hasAZLabels && 'with-labels'}
        >
          <AZSelectionLabel>Availability Zones selection</AZSelectionLabel>
          <RadioWrapperDiv>
            {/* Automatically */}
            <div>
              <div className='fake-radio'>
                <div
                  className={`fake-radio-checked ${
                    hasAZLabels === false && 'visible'
                  }`}
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
                <p className='emphasized'>
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
                <p className='indented' style={{ marginTop: '8px' }}>
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
                  className={`fake-radio-checked ${
                    hasAZLabels === true && 'visible'
                  }`}
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
                  <p className='indented'>
                    You can select up to {maxAZ} availability zones to make use
                    of.
                  </p>
                  <FlexWrapperAZDiv className='indented'>
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
        {this.state.allowSpotInstances && (
          <Section>
            <StyledInput
              label='Instance distribution'
              inputId={`spot-instances-${this.props.id}`}
              // regular space, hides hint ;)
              hint={<>&#32;</>}
            >
              <CheckboxWrapper>
                <Checkbox
                  checked={this.state.spotInstancesEnabled}
                  onChange={this.setSpotInstancesEnabled}
                  label='Enable Spot instances'
                />
              </CheckboxWrapper>
            </StyledInput>
            {this.state.spotInstancesEnabled && (
              <>
                <ClusterCreationLabelSpan>
                  Spot instances
                </ClusterCreationLabelSpan>
                <SpotValuesNumberPickerWrapper>
                  <SpotValuesLabelText>
                    Spot instance percentage
                  </SpotValuesLabelText>
                  <NumberPicker
                    readOnly={false}
                    max={100}
                    min={0}
                    stepSize={10}
                    value={
                      this.state.aws.instanceDistribution.spotInstancePercentage
                    }
                    onChange={this.setSpotInstancePercentage}
                    theme='spot-number-picker'
                  />
                  <SpotValuesLabelText>percent</SpotValuesLabelText>
                </SpotValuesNumberPickerWrapper>
                <SpotValuesHelpText>
                  Controls the percentage of spot instances to be used for
                  worker nodes beyond the number of{' '}
                  <i>on demand base capacity</i>.
                </SpotValuesHelpText>
                <SpotValuesNumberPickerWrapper>
                  <SpotValuesLabelText>
                    On demand base capacity
                  </SpotValuesLabelText>
                  <NumberPicker
                    readOnly={false}
                    min={0}
                    max={32767}
                    stepSize={1}
                    value={
                      this.state.aws.instanceDistribution.onDemandBaseCapacity
                    }
                    onChange={this.setOnDemandBaseCapacity}
                    theme='spot-number-picker'
                  />
                  <SpotValuesLabelText>instances</SpotValuesLabelText>
                </SpotValuesNumberPickerWrapper>
                <SpotValuesHelpText>
                  Controls how much of the initial capacity is made up of
                  on-demand instances.
                </SpotValuesHelpText>
              </>
            )}
          </Section>
        )}
        <Section className='scaling-range'>
          <StyledInput
            labelId={`scaling-range-${this.props.id}`}
            label='Scaling range'
          >
            <NodeCountSelector
              autoscalingEnabled={true}
              label={{ max: 'MAX', min: 'MIN' }}
              onChange={this.updateScaling}
              readOnly={false}
              scaling={this.state.scaling}
            />
          </StyledInput>
        </Section>
      </>
    );
  }
}

AddNodePool.propTypes = {
  availabilityZones: PropTypes.array,
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
  name: Constants.DEFAULT_NODEPOOL_NAME,
};

function mapStateToProps(state) {
  const { availability_zones: AZ } = state.main.info.general;
  const availabilityZones = AZ.zones;
  // More than 4 AZs is not allowed by now.
  // eslint-disable-next-line no-magic-numbers
  const maxAZ = Math.min(AZ.max, 4);
  const minAZ = 1;
  const defaultAZ = AZ.default;
  const selectedOrganization = state.main.selectedOrganization;
  const provider = state.main.info.general.provider;
  const clusterCreationStats = state.main.info.stats.cluster_creation_duration;

  const defaultInstanceType =
    state.main.info.workers.instance_type &&
    state.main.info.workers.instance_type.default
      ? state.main.info.workers.instance_type.default
      : 'm3.large';

  const defaultCPUCores = 4; // TODO
  const defaultMemorySize = 4; // TODO
  const defaultDiskSize = 20; // TODO

  return {
    availabilityZones,
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
