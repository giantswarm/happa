import AZSelection from 'Cluster/AZSelection/AZSelection';
import {
  AvailabilityZoneSelection,
  AZSelectionVariants,
} from 'Cluster/AZSelection/AZSelectionUtils';
import AddNodePoolMachineType from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolMachineType';
import AddNodePoolSpotInstances from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolSpotInstances';
import produce from 'immer';
import { hasAppropriateLength } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Constants, Providers } from 'shared/constants';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import NodeCountSelector from 'shared/NodeCountSelector';
import styled from 'styled-components';
import ClusterCreationLabelSpan from 'UI/Display/Cluster/ClusterCreation/ClusterCreationLabelSpan';
import NameInput from 'UI/Display/Cluster/ClusterCreation/NameInput';
import Section from 'UI/Display/Cluster/ClusterCreation/Section';
import StyledInput, {
  AdditionalInputHint,
} from 'UI/Display/Cluster/ClusterCreation/StyledInput';
import Checkbox from 'UI/Inputs/Checkbox';

const CheckboxWrapper = styled.div`
  .checkbox-label {
    font-size: 16px;
    font-weight: normal;
  }
`;

const AZSelectionWrapper = styled.div`
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
      min: Constants.NP_DEFAULT_MIN_SCALING,
      minValid: true,
      max: Constants.NP_DEFAULT_MAX_SCALING,
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
      spotInstances: {
        maxPrice: 0,
        validationError: '',
        onDemandPricing: true,
      },
    },
    spotInstancesEnabled: false,
  };

  componentDidMount() {
    this.setState({
      ...this.computeAvailabilityZonesPresence(),
    });
  }

  componentDidUpdate() {
    this.updateValue();
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

  setSpotInstancesMaxPrice = (maxPrice) => {
    let validationError = '';
    if (maxPrice < Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MIN) {
      validationError = `The value should be between ${Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MIN} and ${Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MAX}.`;
    }

    this.setState(({ azure }) => ({
      azure: {
        ...azure,
        spotInstances: {
          ...azure.spotInstances,
          maxPrice,
          validationError,
        },
      },
    }));
  };

  setSpotInstancesUseOnDemandPricing = (onDemandPricing) => {
    const maxPrice = onDemandPricing
      ? 0
      : Constants.AZURE_SPOT_INSTANCES_MAX_PRICE_MIN;

    this.setState(({ azure }) => ({
      azure: {
        ...azure,
        spotInstances: {
          ...azure.spotInstances,
          onDemandPricing,
          maxPrice,
          validationError: '',
        },
      },
    }));
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
    const { provider } = this.props;
    const {
      availabilityZonesPicker,
      availabilityZonesLabels,
      azSelection,
      scaling,
      name,
      spotInstancesEnabled,
      azure,
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

    if (
      provider === Providers.AZURE &&
      spotInstancesEnabled &&
      azure.spotInstances.validationError.length > 0
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
      azure,
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

      case Providers.AZURE: {
        let spotInstancesMaxPrice = 0;
        if (spotInstancesEnabled && !azure.spotInstances.onDemandPricing) {
          spotInstancesMaxPrice = azure.spotInstances.maxPrice;
        }

        nodePoolDefinition.node_spec.azure = {
          vm_size: this.state.azure.vmSize,
          spot_instances: {
            enabled: spotInstancesEnabled,
            maxPrice: spotInstancesMaxPrice,
          },
        };

        break;
      }
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
    const { minAZ, maxAZ, defaultAZ, provider, id, capabilities } = this.props;

    const {
      supportsNodePoolAutoscaling,
      supportsNodePoolSpotInstances,
      supportsAlikeInstances,
    } = capabilities;

    const machineType = this.getMachineType();

    const scalingLabel = supportsNodePoolAutoscaling
      ? 'Scaling range'
      : 'Node count';

    let spotInstancesLabel = 'Spot instances';
    if (provider === Providers.AWS) {
      spotInstancesLabel = 'Instance distribution';
    }

    let spotInstancesToggleLabel = 'Enabled';
    if (provider === Providers.AWS) {
      spotInstancesToggleLabel = 'Enable Spot instances';
    }

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

          {supportsAlikeInstances && (
            <CheckboxWrapper>
              <Checkbox
                checked={this.state.aws.useAlike}
                onChange={this.setUseAlikeInstancesEnabled}
                label='Allow usage of similar instance types'
              />
            </CheckboxWrapper>
          )}
        </Section>

        <AZSelectionWrapper>
          <ClusterCreationLabelSpan as='div'>
            Availability Zones selection
          </ClusterCreationLabelSpan>
          <AZSelection
            variant={AZSelectionVariants.NodePool}
            uniqueIdentifier={`np-${id}-az`}
            baseActionName={RUMActions.SelectAZSelection}
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
        </AZSelectionWrapper>

        {supportsNodePoolSpotInstances && (
          <Section>
            <StyledInput
              label={spotInstancesLabel}
              inputId={`spot-instances-${id}`}
              // regular space, hides hint ;)
              hint={<>&#32;</>}
            >
              <CheckboxWrapper>
                <Checkbox
                  checked={this.state.spotInstancesEnabled}
                  onChange={this.setSpotInstancesEnabled}
                  label={spotInstancesToggleLabel}
                />
              </CheckboxWrapper>
            </StyledInput>
            {this.state.spotInstancesEnabled && (
              <AddNodePoolSpotInstances
                provider={provider}
                spotPercentage={
                  this.state.aws.instanceDistribution.spotInstancePercentage
                }
                setSpotPercentage={this.setSpotInstancePercentage}
                onDemandBaseCapacity={
                  this.state.aws.instanceDistribution.onDemandBaseCapacity
                }
                setOnDemandBaseCapacity={this.setOnDemandBaseCapacity}
                maxPrice={this.state.azure.spotInstances.maxPrice}
                setMaxPrice={this.setSpotInstancesMaxPrice}
                maxPriceValidationError={
                  this.state.azure.spotInstances.validationError
                }
                useOnDemandPricing={
                  this.state.azure.spotInstances.onDemandPricing
                }
                setUseOnDemandPricing={this.setSpotInstancesUseOnDemandPricing}
              />
            )}
          </Section>
        )}
        <Section className='scaling-range'>
          <StyledInput labelId={`scaling-range-${id}`} label={scalingLabel}>
            <NodeCountSelector
              autoscalingEnabled={supportsNodePoolAutoscaling}
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
  maxAZ: PropTypes.number,
  minAZ: PropTypes.number,
  defaultAZ: PropTypes.number,
  capabilities: PropTypes.object,
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
