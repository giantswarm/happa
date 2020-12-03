import styled from '@emotion/styled';
import AZSelection from 'Cluster/AZSelection/AZSelection';
import { AvailabilityZoneSelection } from 'Cluster/AZSelection/AZSelectionUtils';
import AddNodePoolMachineType from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolMachineType';
import produce from 'immer';
import { hasAppropriateLength } from 'lib/helpers';
import { compare } from 'lib/semver';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Constants, Providers } from 'shared/constants';
import NodeCountSelector from 'shared/NodeCountSelector';
import { supportsNodePoolAutoscaling } from 'stores/nodepool/utils';
import Checkbox from 'UI/Checkbox';
import ClusterCreationLabelSpan from 'UI/ClusterCreation/ClusterCreationLabelSpan';
import NameInput from 'UI/ClusterCreation/NameInput';
import Section from 'UI/ClusterCreation/Section';
import StyledInput, {
  AdditionalInputHint,
} from 'UI/ClusterCreation/StyledInput';
import NumberPicker from 'UI/NumberPicker';

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

const StyledAZSelection = styled(AZSelection)`
  margin-bottom: ${({ theme }) => theme.spacingPx * 4}px;
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
    azSelection: AvailabilityZoneSelection.Automatic,
    scaling: {
      min: null,
      minValid: true,
      max: null,
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
    azure: {
      vmSize: this.props.defaultVmSize,
    },
    spotInstancesEnabled: false,
    allowSpotInstances: false,
    allowAlikeInstances: false,
  };

  static getDerivedStateFromProps(newProps, prevState) {
    // Set scaling defaults.
    if (prevState.scaling.max === null && prevState.scaling.min === null) {
      const statePatch = {
        scaling: {
          ...prevState.scaling,
        },
      };

      switch (newProps.provider) {
        case Providers.AWS:
          statePatch.scaling.min = Constants.NP_DEFAULT_MIN_SCALING_AWS;
          statePatch.scaling.max = Constants.NP_DEFAULT_MAX_SCALING_AWS;

          break;

        case Providers.AZURE:
          statePatch.scaling.min = Constants.NP_DEFAULT_MIN_SCALING_AZURE;
          statePatch.scaling.max = Constants.NP_DEFAULT_MAX_SCALING_AZURE;

          break;
      }

      return statePatch;
    }

    return null;
  }

  componentDidMount() {
    this.setState({
      ...this.computeInstanceCapabilities(),
      ...this.computeAvailabilityZonesPresence(),
    });
  }

  componentDidUpdate(prevProps) {
    this.updateValue();
    const { selectedRelease: prevSelectedRelease } = prevProps;
    const { selectedRelease } = this.props;
    if (prevSelectedRelease !== selectedRelease) {
      this.setState(this.computeInstanceCapabilities());
    }
  }

  computeAvailabilityZonesPresence = () => {
    const { availabilityZones } = this.props;

    return {
      // Region does not support availability zones.
      azSelection:
        availabilityZones.length === 0
          ? AvailabilityZoneSelection.NotSpecified
          : AvailabilityZoneSelection.Automatic,
    };
  };

  computeInstanceCapabilities = () => {
    const { selectedRelease, provider } = this.props;

    return {
      allowSpotInstances:
        provider === Providers.AWS &&
        compare(Constants.AWS_ONDEMAND_INSTANCES_VERSION, selectedRelease) <= 0,
      allowAlikeInstances:
        provider === Providers.AWS &&
        compare(Constants.AWS_USE_ALIKE_INSTANCES_VERSION, selectedRelease) <=
          0,
    };
  };

  updateName = (name) => {
    const { isValid, message } = hasAppropriateLength(
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

  setMachineType = (machineType) => {
    this.setState((state, props) => {
      switch (props.provider) {
        case Providers.AWS:
          return { aws: { ...state.aws, instanceType: machineType } };

        case Providers.AZURE:
          return { azure: { ...state.azure, vmSize: machineType } };

        default:
          return null;
      }
    });
  };

  getMachineType = () => {
    switch (this.props.provider) {
      case Providers.AWS:
        return this.state.aws.instanceType;

      case Providers.AZURE:
        return this.state.azure.vmSize;

      default:
        return '';
    }
  };

  toggleAZSelector = (azSelection) => {
    this.setState({
      azSelection,
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

  updateAZ = (azSelection) => (payload) => {
    switch (azSelection) {
      case AvailabilityZoneSelection.Automatic:
        this.setState({
          availabilityZonesPicker: payload,
        });
        break;

      case AvailabilityZoneSelection.Manual:
        this.setState({
          availabilityZonesLabels: payload,
        });
        break;
    }
  };

  updateScaling = (nodeCountSelector) => {
    this.setState({ scaling: nodeCountSelector.scaling });
  };

  validate() {
    const {
      availabilityZonesPicker,
      availabilityZonesLabels,
      azSelection,
      scaling,
      name,
    } = this.state;
    if (!name.valid) {
      return false;
    }

    if (!scaling.minValid || !scaling.maxValid) {
      return false;
    }

    if (
      azSelection === AvailabilityZoneSelection.Manual &&
      !availabilityZonesLabels.valid
    ) {
      return false;
    }
    if (
      azSelection === AvailabilityZoneSelection.Automatic &&
      !availabilityZonesPicker.valid
    ) {
      return false;
    }

    return true;
  }

  updateValue = () => {
    // Not checking release version as we would be checking it before accessing this form
    // and sending user too the v4 form if NPs aren't supported
    const {
      availabilityZonesPicker,
      availabilityZonesLabels,
      azSelection,
      scaling,
      name,
      spotInstancesEnabled,
      aws,
    } = this.state;
    const { provider } = this.props;

    const nodePoolDefinition = {
      availability_zones: {},
      name: Constants.DEFAULT_NODEPOOL_NAME,
      node_spec: {},
    };

    // Set name if it was changed.
    if (name.value !== '') {
      nodePoolDefinition.name = name.value;
    }

    // Set Availability zones.
    switch (azSelection) {
      case AvailabilityZoneSelection.Automatic:
        nodePoolDefinition.availability_zones.number =
          availabilityZonesPicker.value;
        break;

      case AvailabilityZoneSelection.Manual:
        nodePoolDefinition.availability_zones.zones =
          availabilityZonesLabels.zonesArray;
        break;

      case AvailabilityZoneSelection.NotSpecified:
        nodePoolDefinition.availability_zones.number = -1;
        break;
    }

    switch (provider) {
      case Providers.AWS: {
        nodePoolDefinition.node_spec.aws = {
          instance_type: aws.instanceType,
          use_alike_instance_types: aws.useAlike,
          instance_distribution: {
            on_demand_base_capacity: 0,
            on_demand_percentage_above_base_capacity: 100,
          },
        };
        // Add spot instances setup.
        if (spotInstancesEnabled) {
          nodePoolDefinition.node_spec.aws.instance_distribution.on_demand_base_capacity =
            aws.instanceDistribution.onDemandBaseCapacity;
          nodePoolDefinition.node_spec.aws.instance_distribution.on_demand_percentage_above_base_capacity =
            /* eslint-disable-next-line no-magic-numbers */
            100 - this.state.aws.instanceDistribution.spotInstancePercentage;
        }

        break;
      }

      case Providers.AZURE:
        nodePoolDefinition.node_spec.azure = {
          vm_size: this.state.azure.vmSize,
        };

        break;
    }

    // Add scaling setup.
    nodePoolDefinition.scaling = {
      min: scaling.min,
      max: scaling.max,
    };

    const isValid = this.validate();

    this.props.informParent(
      {
        isValid,
        data: nodePoolDefinition,
      },
      // We need to know which node pool it is in the v5 cluster creation form
      this.props.id ? this.props.id : null
    );
  };

  render() {
    const { zonesArray } = this.state.availabilityZonesLabels;
    const { azSelection, name } = this.state;
    const { minAZ, maxAZ, defaultAZ, provider, id } = this.props;

    const machineType = this.getMachineType();

    const isScalingAuto = supportsNodePoolAutoscaling(provider);
    const scalingLabel = isScalingAuto ? 'Scaling range' : 'Node count';

    return (
      <>
        <Section>
          <NameInput
            value={name.value}
            label='Name'
            inputId={`node-pool-name-${id}`}
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
          <AddNodePoolMachineType
            id={id}
            onChange={this.setMachineType}
            machineType={machineType}
          />

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

        <StyledAZSelection
          npID={id}
          value={azSelection}
          provider={provider}
          onChange={this.toggleAZSelector}
          minNumOfZones={minAZ}
          maxNumOfZones={maxAZ}
          defaultNumOfZones={defaultAZ}
          allZones={this.props.availabilityZones}
          numOfZones={this.state.availabilityZonesPicker.value}
          selectedZones={zonesArray}
          onUpdateZones={this.updateAZ}
        />

        {this.state.allowSpotInstances && (
          <Section>
            <StyledInput
              label='Instance distribution'
              inputId={`spot-instances-${id}`}
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
                    eventNameSuffix='SPOT_PERCENTAGE'
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
                    eventNameSuffix='ONDEMAND_BASE_CAPACITY'
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
          <StyledInput labelId={`scaling-range-${id}`} label={scalingLabel}>
            <NodeCountSelector
              autoscalingEnabled={isScalingAuto}
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
  provider: PropTypes.string,
  defaultInstanceType: PropTypes.string,
  defaultVmSize: PropTypes.string,
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
  const availabilityZones = AZ?.zones ?? [];
  // More than 4 AZs is not allowed by now.
  // eslint-disable-next-line no-magic-numbers
  const maxAZ = Math.min(AZ?.max ?? 0, 4);
  const minAZ = 1;
  const defaultAZ = AZ.default;
  const provider = state.main.info.general.provider;

  const defaultInstanceType =
    state.main.info.workers.instance_type &&
    state.main.info.workers.instance_type.default
      ? state.main.info.workers.instance_type.default
      : 'm3.large';

  const defaultVmSize =
    state.main.info.workers.vm_size?.default ??
    Constants.AZURE_NODEPOOL_DEFAULT_VM_SIZE;

  return {
    availabilityZones,
    provider,
    defaultInstanceType,
    defaultVmSize,
    minAZ,
    maxAZ,
    defaultAZ,
  };
}

export default connect(mapStateToProps)(AddNodePool);
