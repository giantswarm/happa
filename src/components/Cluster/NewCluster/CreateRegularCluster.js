import InstanceTypeSelector from 'Cluster/ClusterDetail/InstanceTypeSelector/InstanceTypeSelector';
import { Box } from 'grommet';
import React from 'react';
import { connect } from 'react-redux';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { Constants, Providers } from 'shared/constants';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import NodeCountSelector from 'shared/NodeCountSelector';
import { batchedClusterCreate } from 'stores/batchActions';
import { BATCHED_CLUSTER_CREATION_REQUEST } from 'stores/cluster/constants';
import { selectLoadingFlagByAction } from 'stores/loading/selectors';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import HorizontalLine from 'UI/Display/Cluster/ClusterCreation/HorizontalLine';
import FlashMessage from 'UI/Display/FlashMessage';
import InputGroup from 'UI/Inputs/InputGroup';
import { FlexColumn, FlexRow } from 'UI/Layout/FlexDivs';

import ClusterCreationDuration from './ClusterCreationDuration';
import KVMWorkerConfiguration from './KVMWorkerConfiguration';
import ProviderCredentials from './ProviderCredentials';
import V4AvailabilityZonesSelector from './V4AvailabilityZonesSelector';

const WrapperDiv = styled.div`
  .worker-nodes {
    position: absolute;
    left: 0;
    font-weight: 700;
  }
`;

class CreateRegularCluster extends React.Component {
  static isScalingAutomatic(provider) {
    return provider === Providers.AWS;
  }

  static getMultiAZSelectorProps(provider, currentReleaseVersion) {
    const multiAZSelectorProps = {};

    if (provider === Providers.AZURE) {
      multiAZSelectorProps.requiredReleaseVersion =
        Constants.AZURE_MULTI_AZ_VERSION;
      multiAZSelectorProps.currentReleaseVersion = currentReleaseVersion;
    }

    return multiAZSelectorProps;
  }

  static getWorkerConfigurationComponent(provider) {
    switch (provider) {
      case Providers.AWS:
        return { component: InstanceTypeSelector, label: 'Instance type' };
      case Providers.AZURE:
        return { component: InstanceTypeSelector, label: 'VM size' };
      case Providers.KVM:
        return {
          component: KVMWorkerConfiguration,
          label: 'Worker configuration',
        };
    }

    return null;
  }

  state = {
    availabilityZonesPicker: {
      value: 1,
      valid: true,
    },
    // eslint-disable-next-line react/no-unused-state
    releaseVersion: this.props.selectedRelease,
    scaling: {
      automatic: false,
      min: 3,
      minValid: true,
      max: 3,
      maxValid: true,
    },
    // eslint-disable-next-line react/no-unused-state
    valid: false, // Start off invalid now since we're not sure we have a valid release yet, the release endpoint could be malfunctioning.
    error: false,
    aws: {
      instanceType: this.props.defaultInstanceType,
    },
    azure: {
      vmSize: this.props.defaultVMSize,
    },
    kvm: {
      cpuCores: {
        value: this.props.defaultCPUCores,
        valid: true,
      },
      memorySize: {
        value: this.props.defaultMemorySize,
        valid: true,
      },
      diskSize: {
        value: this.props.defaultDiskSize,
        valid: true,
      },
    },
  };

  updateAvailabilityZonesPicker = (n) => {
    this.setState({
      availabilityZonesPicker: {
        value: n.value,
        valid: n.valid,
      },
    });
  };

  updateScaling = (nodeCountSelector) => {
    this.setState({
      scaling: {
        min: nodeCountSelector.scaling.min,
        minValid: nodeCountSelector.scaling.minValid,
        max: nodeCountSelector.scaling.max,
        maxValid: nodeCountSelector.scaling.maxValid,
      },
    });
  };

  createCluster = async () => {
    let worker = {};
    switch (this.props.provider) {
      case Providers.AWS:
        worker = {
          aws: {
            instance_type: this.state.aws.instanceType,
          },
        };
        break;

      case Providers.AZURE:
        worker = {
          azure: {
            vm_size: this.state.azure.vmSize,
          },
        };
        break;

      case Providers.KVM:
        worker = {
          memory: { size_gb: this.state.kvm.memorySize.value },
          storage: { size_gb: this.state.kvm.diskSize.value },
          cpu: { cores: this.state.kvm.cpuCores.value },
        };
        break;
    }
    let workers = new Array(this.state.scaling.min).fill(worker);

    // Adjust final workers array when cluster uses auto scaling. This is currently
    // only in AWS and from release 6.1.0 onwards.
    if (
      CreateRegularCluster.isScalingAutomatic(
        this.props.provider,
        this.props.selectedRelease
      ) &&
      workers.length > 1
    ) {
      // Only one worker is allowed to be present when auto scaling is enabled.
      workers = [worker];
    }

    await this.props.dispatch(
      batchedClusterCreate({
        availability_zones: this.state.availabilityZonesPicker.value,
        scaling: {
          min: this.state.scaling.min,
          max: this.state.scaling.max,
        },
        name: this.props.clusterName,
        owner: this.props.selectedOrganization,
        release_version: this.props.selectedRelease,
        workers,
      })
    );
  };

  errorState() {
    return (
      <FlashMessage type='danger'>
        <b>Something went wrong while trying to create your cluster.</b>
        <br />
        Perhaps our servers are down, please try again later or contact support:
        support@giantswarm.io
        <br />
        {this.state.errorMessage !== '' ? (
          <pre>{this.state.errorMessage}</pre>
        ) : undefined}
      </FlashMessage>
    );
  }

  setAWSInstanceType = (instanceType) => {
    this.setState({ aws: { instanceType } });
  };

  setAzureVMSize = (vmSize) => {
    this.setState({ azure: { vmSize } });
  };

  updateCPUCores = (value) => {
    this.setState((prevState) => ({
      kvm: {
        cpuCores: {
          value: value.value,
          valid: value.valid,
        },
        memorySize: prevState.kvm.memorySize,
        diskSize: prevState.kvm.diskSize,
      },
    }));
  };

  updateMemorySize = (value) => {
    this.setState((prevState) => ({
      kvm: {
        cpuCores: prevState.kvm.cpuCores,
        memorySize: {
          value: value.value,
          valid: value.valid,
        },
        diskSize: prevState.kvm.diskSize,
      },
    }));
  };

  updateDiskSize = (value) => {
    this.setState((prevState) => ({
      kvm: {
        cpuCores: prevState.kvm.cpuCores,
        memorySize: prevState.kvm.memorySize,
        diskSize: {
          value: value.value,
          valid: value.valid,
        },
      },
    }));
  };

  valid() {
    if (!this.props.allowSubmit) return false;

    // If any of the releaseVersion hasn't been set yet, return false
    if (!this.props.selectedRelease) return false;

    // If the availabilityZonesPicker is invalid, return false
    if (!this.state.availabilityZonesPicker.valid) return false;

    // If the min scaling numberpicker is invalid, return false
    if (!this.state.scaling.minValid) return false;

    // If the max scaling numberpickers is invalid, return false
    if (!this.state.scaling.maxValid) return false;

    // If the kvm worker is invalid, return false
    if (
      !(
        this.state.kvm.cpuCores.valid &&
        this.state.kvm.memorySize.valid &&
        this.state.kvm.diskSize.valid
      )
    ) {
      return false;
    }

    return true;
  }

  render() {
    const { provider, isClusterCreating } = this.props;

    const multiAZSelectorProps = CreateRegularCluster.getMultiAZSelectorProps(
      provider,
      this.props.selectedRelease
    );

    const {
      component: WorkerConfiguration,
      label: workerConfigurationLabel,
    } = CreateRegularCluster.getWorkerConfigurationComponent(provider);

    return (
      <WrapperDiv data-testid='cluster-creation-view'>
        <HorizontalLine />

        <FlexColumn>
          <div className='worker-nodes'>Worker nodes</div>
          <Box direction='column' gap='medium'>
            {(provider === Providers.AWS || provider === Providers.AZURE) && (
              <V4AvailabilityZonesSelector
                minValue={this.props.minAvailabilityZones}
                maxValue={this.props.maxAvailabilityZones}
                onChange={this.updateAvailabilityZonesPicker}
                {...multiAZSelectorProps}
              />
            )}
            <InputGroup label={workerConfigurationLabel}>
              <WorkerConfiguration
                selectedInstanceType={
                  provider === Providers.AWS
                    ? this.state.aws.instanceType
                    : this.state.azure.vmSize
                }
                selectInstanceType={
                  provider === Providers.AWS
                    ? this.setAWSInstanceType
                    : this.setAzureVMSize
                }
                cpuCores={this.state.kvm.cpuCores.value}
                diskSize={this.state.kvm.diskSize.value}
                memorySize={this.state.kvm.memorySize.value}
                onUpdateCPUCores={this.updateCPUCores}
                onUpdateDiskSize={this.updateDiskSize}
                onUpdateMemorySize={this.updateMemorySize}
              />
            </InputGroup>
            <InputGroup
              label='Number of worker nodes'
              error={this.state.error && this.errorState()}
            >
              <NodeCountSelector
                autoscalingEnabled={CreateRegularCluster.isScalingAutomatic(
                  provider,
                  this.props.selectedRelease
                )}
                maxValue={this.props.maxWorkersPerCluster}
                onChange={this.updateScaling}
                readOnly={false}
                scaling={this.state.scaling}
              />
              <ProviderCredentials
                organizationName={this.props.selectedOrganization}
                provider={provider}
              />
            </InputGroup>
          </Box>
        </FlexColumn>

        <HorizontalLine />

        <FlexRow>
          <Box gap='small' direction='row'>
            <RUMActionTarget name={RUMActions.CreateClusterSubmit}>
              <Button
                primary={true}
                disabled={!this.valid()}
                loading={isClusterCreating}
                onClick={this.createCluster}
                type='submit'
              >
                Create cluster
              </Button>
            </RUMActionTarget>
            {!isClusterCreating && (
              <RUMActionTarget name={RUMActions.CreateClusterCancel}>
                <Button
                  loading={isClusterCreating}
                  onClick={this.props.closeForm}
                  type='button'
                >
                  Cancel
                </Button>
              </RUMActionTarget>
            )}
          </Box>
        </FlexRow>
        <FlexColumn>
          <ClusterCreationDuration stats={this.props.clusterCreationStats} />
        </FlexColumn>
      </WrapperDiv>
    );
  }
}

CreateRegularCluster.defaultProps = {
  defaultInstanceType: 'm3.large',
  defaultVMSize: 'Standard_D2s_v3',
  defaultCPUCores: 4,
  defaultMemorySize: 4,
  defaultDiskSize: 20,
};

function mapStateToProps(state) {
  const provider = window.config.info.general.provider;
  const propsToPush = {
    minAvailabilityZones: window.config.info.general.availabilityZones.default,
    maxAvailabilityZones: window.config.info.general.availabilityZones.max,
    clusterCreationStats: {
      cluster_creation_duration: { median: 0, p25: 0, p75: 0 },
    },
    provider,
    defaultInstanceType: window.config.info.workers.instanceType.default,
    defaultVMSize: window.config.info.workers.vmSize.default,
    maxWorkersPerCluster: window.config.info.workers.countPerCluster.max,
  };

  return {
    ...propsToPush,
    isClusterCreating: selectLoadingFlagByAction(
      state,
      BATCHED_CLUSTER_CREATION_REQUEST
    ),
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
)(CreateRegularCluster);
